import { Component, createContext } from 'react';
import type { ReactNode } from 'react';
import Graphic from '@arcgis/core/Graphic';

interface HighlightContext {
  highlightedGraphic: Graphic | null;
  selectedGraphic: Graphic | null;
}

export const MapHighlightContext = createContext<HighlightContext>({
  highlightedGraphic: null,
  selectedGraphic: null,
});

type Props = { children: ReactNode };
type State = {
  highlightedGraphic: Graphic | null;
  selectedGraphic: Graphic | null;
  getHighlightedGraphic: () => Graphic | null;
  getSelectedGraphic: () => Graphic | null;
  setHighlightedGraphic: (graphic: Graphic) => void;
  setSelectedGraphic: (graphic: Graphic) => void;
};

export class MapHighlightProvider extends Component<Props, State> {
  state: State = {
    highlightedGraphic: null,
    selectedGraphic: null,
    getHighlightedGraphic: () => {
      return this.state.highlightedGraphic;
    },
    getSelectedGraphic: () => {
      return this.state.selectedGraphic;
    },
    setHighlightedGraphic: (highlightedGraphic: Graphic) => {
      this.setState({ highlightedGraphic });
    },
    setSelectedGraphic: (selectedGraphic: Graphic) => {
      this.setState({ selectedGraphic });
    },
  };

  render() {
    return (
      <MapHighlightContext.Provider value={this.state}>
        {this.props.children}
      </MapHighlightContext.Provider>
    );
  }
}
