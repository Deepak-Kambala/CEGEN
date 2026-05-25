import { useReducer, useCallback } from 'react';

const initialState = {
  currentStep: 1,
  templateImg: null,
  templateOrigW: 0,
  templateOrigH: 0,
  fields: [],
  selectedFieldId: null,
  mode: 'draw',
  excelData: [],
  allTimeCount: parseInt(localStorage.getItem('cegen_total') || '0'),
  currentPreviewIdx: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_TEMPLATE':
      return {
        ...state,
        templateImg: action.payload.img,
        templateOrigW: action.payload.w,
        templateOrigH: action.payload.h,
      };
    case 'ADD_FIELD':
      return { ...state, fields: [...state.fields, action.payload] };
    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map(f =>
          f.id === action.payload.id ? { ...f, ...action.payload.updates } : f
        ),
      };
    case 'DELETE_FIELD':
      return {
        ...state,
        fields: state.fields.filter(f => f.id !== action.payload),
        selectedFieldId: state.selectedFieldId === action.payload ? null : state.selectedFieldId,
      };
    case 'SET_SELECTED_FIELD':
      return { ...state, selectedFieldId: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_EXCEL_DATA':
      return { ...state, excelData: action.payload };
    case 'SET_PREVIEW_IDX':
      return { ...state, currentPreviewIdx: action.payload };
    case 'INCREMENT_ALL_TIME': {
      const newCount = state.allTimeCount + action.payload;
      localStorage.setItem('cegen_total', newCount);
      return { ...state, allTimeCount: newCount };
    }
    default:
      return state;
  }
}

export function useAppStore() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setStep = useCallback((n) => dispatch({ type: 'SET_STEP', payload: n }), []);
  const setTemplate = useCallback((img, w, h) =>
    dispatch({ type: 'SET_TEMPLATE', payload: { img, w, h } }), []);
  const addField = useCallback((field) => dispatch({ type: 'ADD_FIELD', payload: field }), []);
  const updateField = useCallback((id, updates) =>
    dispatch({ type: 'UPDATE_FIELD', payload: { id, updates } }), []);
  const deleteField = useCallback((id) => dispatch({ type: 'DELETE_FIELD', payload: id }), []);
  const setSelectedField = useCallback((id) =>
    dispatch({ type: 'SET_SELECTED_FIELD', payload: id }), []);
  const setMode = useCallback((m) => dispatch({ type: 'SET_MODE', payload: m }), []);
  const setExcelData = useCallback((data) => dispatch({ type: 'SET_EXCEL_DATA', payload: data }), []);
  const setPreviewIdx = useCallback((idx) => dispatch({ type: 'SET_PREVIEW_IDX', payload: idx }), []);
  const incrementAllTime = useCallback((n) =>
    dispatch({ type: 'INCREMENT_ALL_TIME', payload: n }), []);

  return {
    state,
    actions: {
      setStep, setTemplate, addField, updateField, deleteField,
      setSelectedField, setMode, setExcelData, setPreviewIdx, incrementAllTime,
    },
  };
}
