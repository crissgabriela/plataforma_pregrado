export type ComponentType = 'source' | 'resistor' | 'capacitor' | 'switch' | 'ammeter';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  angle: number;
  
  voltage?: number;       // Para fuente [V]
  resistance?: number;    // Para resistor [Ω]
  capacitance?: number;   // Para capacitor [F]
  isOhmic?: boolean;      // Ohmic vs Ampolleta no óhmica
  isOpen?: boolean;       // Para interruptor
  
  tempResistance?: number;
  charge?: number;        // Carga capacitor [C]
  voltageCapacitor?: number;
  
  nominalVoltage: number;
  failed: boolean;
  failureType?: 'open' | 'short';
}

export interface Terminal {
  id: string;
  componentId: string;
  type: 'positive' | 'negative' | 'terminal_a' | 'terminal_b';
  label: string;
  relX: number;
  relY: number;
}

export interface Wire {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
  pathPoints?: ElementPosition[];
  customColor?: 'auto' | 'red' | 'black' | 'blue' | 'green' | 'yellow';
}

export interface ElementPosition {
  x: number;
  y: number;
}

export interface VoltmeterProbe {
  x: number;
  y: number;
  dragging: boolean;
  snappedTerminalId: string | null;
}

export interface DataPoint {
  time: number;
  measuredV: number;
  measuredI: number;
  theoreticalV?: number;
  theoreticalI?: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  setup: () => {
    components: CircuitComponent[];
    wires: Wire[];
  };
}
