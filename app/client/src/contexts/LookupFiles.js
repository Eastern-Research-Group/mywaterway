// @flow

import React from 'react';
import type { Node } from 'react';
// utilities
import { lookupFetch } from 'utils/fetchUtils';

// Common function for setting the context/state of lookup files.
function getLookupFile(filename: string, setVariable: Function) {
  setVariable({ status: 'fetching', data: null });

  // fetch the lookup file
  lookupFetch(filename)
    .then((data) => {
      setVariable({ status: 'success', data });
    })
    .catch((err) => {
      console.error(err);
      setVariable({ status: 'failure', data: err });
    });
}

// --- components ---
type LookupFile = {
  status: 'none' | 'fetching' | 'success' | 'failure',
  data: Object,
};

type LookupFiles = {
  surveyMapping: LookupFile,
  setSurveyMapping: Function,
  waterTypeOptions: LookupFile,
  setWaterTypeOptions: Function,
};

const LookupFilesContext: Object = React.createContext<LookupFiles>({
  surveyMapping: { status: 'none', data: null },
  setSurveyMapping: () => {},
  waterTypeOptions: { status: 'none', data: null },
  setWaterTypeOptions: () => {},
});

type Props = {
  children: Node,
};

function LookupFilesProvider({ children }: Props) {
  const [surveyMapping, setSurveyMapping] = React.useState({
    status: 'none',
    data: [],
  });
  const [waterTypeOptions, setWaterTypeOptions] = React.useState({
    status: 'none',
    data: [],
  });

  return (
    <LookupFilesContext.Provider
      value={{
        surveyMapping,
        setSurveyMapping,
        waterTypeOptions,
        setWaterTypeOptions,
      }}
    >
      {children}
    </LookupFilesContext.Provider>
  );
}

// Custom hook for the surveyMapping.json lookup file.
let surveyMappingInitialized = false; // global var for ensuring fetch only happens once
function useSurveyMappingContext() {
  const { surveyMapping, setSurveyMapping } = React.useContext(
    LookupFilesContext,
  );

  // fetch the lookup file if necessary
  if (!surveyMappingInitialized) {
    surveyMappingInitialized = true;
    getLookupFile('surveyMapping.json', setSurveyMapping);
  }

  return surveyMapping;
}

// Custom hook for the waterTypeOptions.json lookup file.
let waterTypeOptionsInitialized = false; // global var for ensuring fetch only happens once
function useWaterTypeOptionsContext() {
  const { waterTypeOptions, setWaterTypeOptions } = React.useContext(
    LookupFilesContext,
  );

  // fetch the lookup file if necessary
  if (!waterTypeOptionsInitialized) {
    waterTypeOptionsInitialized = true;
    getLookupFile('waterTypeOptions.json', setWaterTypeOptions);
  }

  return waterTypeOptions;
}

export {
  LookupFilesProvider,
  useSurveyMappingContext,
  useWaterTypeOptionsContext,
};
