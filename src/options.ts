export enum ArtTypeOption {
  Boxart = 'boxart',
  Snap = 'snap',
  Title = 'title'
}

export type Options = {
  width: number;
  height?: number;
  type: ArtTypeOption;
  force?: boolean;
  ai?: boolean;
  aiModel: string;
  regions: string;
  cleanup?: boolean;
};
