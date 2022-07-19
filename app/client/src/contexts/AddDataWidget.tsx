import { createContext, useState } from 'react';
// types
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type Layer from '@arcgis/core/layers/Layer';
import type PortalItem from '@arcgis/core/portal/PortalItem';
import type PortalQueryResult from '@arcgis/core/portal/PortalQueryResult';

type SearchResultsState =
  | { status: 'idle' | 'fetching' | 'failure'; data: null }
  | { status: 'success'; data: PortalQueryResult | null };

export interface WidgetLayer extends Layer {
  portalItem?: PortalItem;
}

type AddDataWidget = {
  addDataWidgetVisible: boolean;
  setAddDataWidgetVisible: Function;
  pageNumber: number;
  setPageNumber: Function;
  searchResults: SearchResultsState;
  setSearchResults: Dispatch<SetStateAction<SearchResultsState>>;
  widgetLayers: WidgetLayer[];
  setWidgetLayers: Dispatch<SetStateAction<WidgetLayer[]>>;
};

export const AddDataWidgetContext = createContext<AddDataWidget>({
  addDataWidgetVisible: false,
  setAddDataWidgetVisible: () => {},
  pageNumber: 1,
  setPageNumber: () => {},
  searchResults: { status: 'idle', data: null },
  setSearchResults: () => {},
  widgetLayers: [],
  setWidgetLayers: () => {},
});

type Props = {
  children: ReactNode;
};

export function AddDataWidgetProvider({ children }: Props) {
  const [addDataWidgetVisible, setAddDataWidgetVisible] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchResults, setSearchResults] = useState<SearchResultsState>({
    status: 'idle',
    data: null,
  });
  const [widgetLayers, setWidgetLayers] = useState<WidgetLayer[]>([]);

  return (
    <AddDataWidgetContext.Provider
      value={{
        addDataWidgetVisible,
        setAddDataWidgetVisible,
        pageNumber,
        setPageNumber,
        searchResults,
        setSearchResults,
        widgetLayers,
        setWidgetLayers,
      }}
    >
      {children}
    </AddDataWidgetContext.Provider>
  );
}
