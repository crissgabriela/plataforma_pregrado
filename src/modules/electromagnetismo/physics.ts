import { CircuitComponent, Wire } from '../../types/electromagnetismo';

export interface SolvedNode {
  index: number;
  voltage: number;
}

export interface SolvedCircuit {
  componentCurrents: Record<string, number>;
  terminalVoltages: Record<string, number>;
  warnings: string[];
  updatedComponents: CircuitComponent[];
}

export function solveCircuit(
  components: CircuitComponent[],
  wires: Wire[],
  dt: number
): SolvedCircuit {
  const warnings: string[] = [];

  const getTerminals = (c: CircuitComponent) => {
    switch (c.type) {
      case 'source':
        return [
          { id: `${c.id}_pos`, componentId: c.id, role: 'pos' },
          { id: `${c.id}_neg`, componentId: c.id, role: 'neg' }
        ];
      case 'capacitor':
        return [
          { id: `${c.id}_pos`, componentId: c.id, role: 'pos' },
          { id: `${c.id}_neg`, componentId: c.id, role: 'neg' }
        ];
      default:
        return [
          { id: `${c.id}_a`, componentId: c.id, role: 'a' },
          { id: `${c.id}_b`, componentId: c.id, role: 'b' }
        ];
    }
  };

  const allTerminals: string[] = [];
  const terminalToComponent: Record<string, string> = {};
  
  components.forEach(c => {
    const terminals = getTerminals(c);
    terminals.forEach(t => {
      allTerminals.push(t.id);
      terminalToComponent[t.id] = c.id;
    });
  });

  const parent: Record<string, string> = {};
  allTerminals.forEach(t => { parent[t] = t; });

  const find = (t: string): string => {
    if (parent[t] === t) return t;
    parent[t] = find(parent[t]);
    return parent[t];
  };

  const union = (t1: string, t2: string) => {
    const root1 = find(t1);
    const root2 = find(t2);
    if (root1 !== root2) {
      parent[root1] = root2;
    }
  };

  wires.forEach(w => {
    if (allTerminals.includes(w.fromTerminalId) && allTerminals.includes(w.toTerminalId)) {
      union(w.fromTerminalId, w.toTerminalId);
    }
  });

  const roots = Array.from(new Set(allTerminals.map(t => find(t))));
  const nodeCount = roots.length;

  if (nodeCount === 0) {
    return {
      componentCurrents: {},
      terminalVoltages: {},
      warnings: [],
      updatedComponents: [...components]
    };
  }

  const nodeToIndex: Record<string, number> = {};
  roots.forEach((root, idx) => {
    nodeToIndex[root] = idx;
  });

  const getTerminalNodeIndex = (terminalId: string): number => {
    const root = find(terminalId);
    return nodeToIndex[root];
  };

  let groundNodeIndex = 0;
  const firstSource = components.find(c => c.type === 'source' && !c.failed);
  if (firstSource) {
    groundNodeIndex = getTerminalNodeIndex(`${firstSource.id}_neg`);
  }

  const G = Array.from({ length: nodeCount }, () => new Float64Array(nodeCount));
  const I_vec = new Float64Array(nodeCount);

  const addConductance = (node1: number, node2: number, value: number) => {
    if (isNaN(value) || !isFinite(value)) return;
    G[node1][node1] += value;
    G[node2][node2] += value;
    G[node1][node2] -= value;
    G[node2][node1] -= value;
  };

  const injectCurrent = (nodeInto: number, nodeFrom: number, amount: number) => {
    if (isNaN(amount) || !isFinite(amount)) return;
    I_vec[nodeInto] += amount;
    I_vec[nodeFrom] -= amount;
  };

  const tempComponents: CircuitComponent[] = components.map(c => ({ ...c }));

  tempComponents.forEach(c => {
    if (c.failed) {
      const nA = getTerminalNodeIndex(c.type === 'source' || c.type === 'capacitor' ? `${c.id}_pos` : `${c.id}_a`);
      const nB = getTerminalNodeIndex(c.type === 'source' || c.type === 'capacitor' ? `${c.id}_neg` : `${c.id}_b`);
      if (c.failureType === 'short') {
        addConductance(nA, nB, 1.0);
      } else {
        addConductance(nA, nB, 1e-12);
      }
      return;
    }

    switch (c.type) {
      case 'source': {
        const nPos = getTerminalNodeIndex(`${c.id}_pos`);
        const nNeg = getTerminalNodeIndex(`${c.id}_neg`);
        const R_src = 0.1;
        const G_src = 1 / R_src;
        const V_val = c.voltage ?? 12;
        const I_src = V_val / R_src;
        
        addConductance(nPos, nNeg, G_src);
        injectCurrent(nPos, nNeg, I_src);
        break;
      }
      case 'resistor': {
        const nA = getTerminalNodeIndex(`${c.id}_a`);
        const nB = getTerminalNodeIndex(`${c.id}_b`);
        let rVal = c.resistance ?? 100;
        if (!c.isOhmic) {
          rVal = c.tempResistance ?? rVal;
        }
        addConductance(nA, nB, 1 / rVal);
        break;
      }
      case 'capacitor': {
        const nPos = getTerminalNodeIndex(`${c.id}_pos`);
        const nNeg = getTerminalNodeIndex(`${c.id}_neg`);
        const C_val = c.capacitance ?? 0.01;
        const G_eq = C_val / dt;
        const V_prev = c.voltageCapacitor ?? 0;
        const I_eq = G_eq * V_prev;

        addConductance(nPos, nNeg, G_eq);
        injectCurrent(nNeg, nPos, I_eq); 
        break;
      }
      case 'switch': {
        const nA = getTerminalNodeIndex(`${c.id}_a`);
        const nB = getTerminalNodeIndex(`${c.id}_b`);
        const rSwitch = c.isOpen ? 1e10 : 1e-3;
        addConductance(nA, nB, 1 / rSwitch);
        break;
      }
      case 'ammeter': {
        const nA = getTerminalNodeIndex(`${c.id}_a`);
        const nB = getTerminalNodeIndex(`${c.id}_b`);
        addConductance(nA, nB, 1 / 1e-3);
        break;
      }
    }
  });

  for (let col = 0; col < nodeCount; col++) {
    G[groundNodeIndex][col] = (col === groundNodeIndex) ? 1.0 : 0.0;
  }
  I_vec[groundNodeIndex] = 0.0;

  const nodeVoltages = new Float64Array(nodeCount);
  const M = Array.from({ length: nodeCount }, (_, r) => {
    const row = new Float64Array(nodeCount + 1);
    row.set(G[r]);
    row[nodeCount] = I_vec[r];
    return row;
  });

  for (let i = 0; i < nodeCount; i++) {
    let maxRow = i;
    for (let r = i + 1; r < nodeCount; r++) {
      if (Math.abs(M[r][i]) > Math.abs(M[maxRow][i])) {
        maxRow = r;
      }
    }

    if (maxRow !== i) {
      const temp = M[i];
      M[i] = M[maxRow];
      M[maxRow] = temp;
    }

    if (Math.abs(M[i][i]) < 1e-15) {
      M[i][i] = 1.0;
      for (let j = 0; j < nodeCount; j++) {
        if (j !== i) M[i][j] = 0.0;
      }
      M[i][nodeCount] = 0.0;
    }

    for (let r = i + 1; r < nodeCount; r++) {
      const factor = M[r][i] / M[i][i];
      for (let c = i; c <= nodeCount; c++) {
        M[r][c] -= factor * M[i][c];
      }
    }
  }

  for (let i = nodeCount - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < nodeCount; j++) {
      sum += M[i][j] * nodeVoltages[j];
    }
    nodeVoltages[i] = (M[i][nodeCount] - sum) / M[i][i];
  }

  const terminalVoltages: Record<string, number> = {};
  allTerminals.forEach(tId => {
    const nodeIdx = getTerminalNodeIndex(tId);
    terminalVoltages[tId] = isNaN(nodeVoltages[nodeIdx]) ? 0 : nodeVoltages[nodeIdx];
  });

  const componentCurrents: Record<string, number> = {};

  const nextComponents: CircuitComponent[] = tempComponents.map(c => {
    if (c.failed) {
      componentCurrents[c.id] = 0;
      return c;
    }

    switch (c.type) {
      case 'source': {
        const vPos = terminalVoltages[`${c.id}_pos`];
        const vNeg = terminalVoltages[`${c.id}_neg`];
        const vSource = c.voltage ?? 12;
        const R_src = 0.1;
        const current = (vSource - (vPos - vNeg)) / R_src;
        componentCurrents[c.id] = current;
        if (Math.abs(current) > 200) {
          warnings.push(`¡Cortocircuito en Fuente de Poder ${c.id}! El fusible de seguridad de la red virtual se disparó.`);
          c.failed = true;
          c.failureType = 'open';
        }
        break;
      }
      case 'resistor': {
        const vA = terminalVoltages[`${c.id}_a`];
        const vB = terminalVoltages[`${c.id}_b`];
        const vDiff = vA - vB;
        let rVal = c.resistance ?? 100;
        
        if (!c.isOhmic) {
          const current = vDiff / (c.tempResistance ?? rVal);
          componentCurrents[c.id] = current;
          const alpha = 0.8;
          const targetR = rVal * (1 + alpha * Math.pow(current, 2));
          const lambda = 0.15;
          c.tempResistance = (c.tempResistance ?? rVal) + (targetR - (c.tempResistance ?? rVal)) * lambda;
          
          if (Math.abs(vDiff) > c.nominalVoltage) {
            warnings.push(`¡Falla de componente! Se excedió el voltaje nominal de la ampolleta (${c.nominalVoltage}V). El filamento se fundió.`);
            c.failed = true;
            c.failureType = 'open';
          }
        } else {
          const current = vDiff / rVal;
          componentCurrents[c.id] = current;
          if (Math.abs(vDiff) > c.nominalVoltage) {
            warnings.push(`¡Sobrecarga en Resistencia! El voltaje excedió el voltaje máximo de seguridad (${c.nominalVoltage}V). Resistencia abierta.`);
            c.failed = true;
            c.failureType = 'open';
          }
        }
        break;
      }
      case 'capacitor': {
        const vPos = terminalVoltages[`${c.id}_pos`];
        const vNeg = terminalVoltages[`${c.id}_neg`];
        const vDiff = vPos - vNeg;
        const C_val = c.capacitance ?? 0.01;
        const G_eq = C_val / dt;
        const I_eq = G_eq * (c.voltageCapacitor ?? 0);
        const current = G_eq * vDiff - I_eq;
        componentCurrents[c.id] = current;
        c.voltageCapacitor = vDiff;
        c.charge = C_val * vDiff;

        if (vDiff < -0.05) {
          if (!warnings.some(w => w.includes('Daño Grave Electrolítico'))) {
            warnings.push(`* Riesgo de daño en componente real * Condensador electrolítico polarizado de forma inversa.`);
          }
        }

        if (vDiff > c.nominalVoltage) {
          warnings.push(`¡Ruptura dieléctrica en Capacitor! El voltaje superó el límite de diseño de ${c.nominalVoltage}V. El capacitor explotó.`);
          c.failed = true;
          c.failureType = 'short';
          c.voltageCapacitor = 0;
          c.charge = 0;
        }
        break;
      }
      case 'switch': {
        const vA = terminalVoltages[`${c.id}_a`];
        const vB = terminalVoltages[`${c.id}_b`];
        const vDiff = vA - vB;
        const rSwitch = c.isOpen ? 1e10 : 1e-3;
        const current = vDiff / rSwitch;
        componentCurrents[c.id] = current;
        if (c.isOpen && Math.abs(vDiff) > c.nominalVoltage) {
          warnings.push(`¡Arco eléctrico! Voltaje de ${Math.round(vDiff)}V fundió los terminales de contacto del Interruptor.`);
          c.failed = true;
          c.failureType = 'short';
        }
        break;
      }
      case 'ammeter': {
        const vA = terminalVoltages[`${c.id}_a`];
        const vB = terminalVoltages[`${c.id}_b`];
        const current = (vA - vB) / 1e-3;
        componentCurrents[c.id] = current;
        if (Math.abs(current) > c.nominalVoltage) {
          warnings.push(`¡Fusible quemado en Amperímetro! Se superó el límite de medición máximo de ${c.nominalVoltage}A.`);
          c.failed = true;
          c.failureType = 'open';
        }
        break;
      }
    }

    return c;
  });

  return {
    componentCurrents,
    terminalVoltages,
    warnings,
    updatedComponents: nextComponents
  };
}

export function calculateTheoreticalDischarge(V0: number, R: number, C: number, t: number): number {
  return V0 * Math.exp(-t / (R * C));
}

export function calculateTheoreticalCharge(V0: number, R: number, C: number, t: number): number {
  return V0 * (1 - Math.exp(-t / (R * C)));
}
