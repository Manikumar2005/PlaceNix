import React, { createContext, useState, useContext } from 'react';

const PredictionContext = createContext();

export const PredictionProvider = ({ children }) => {
  const [predictionData, setPredictionDataState] = useState(() => {
    const saved = localStorage.getItem("predictionData");
    return saved ? JSON.parse(saved) : null;
  });

  const setPredictionData = (data) => {
    if (data) {
      localStorage.setItem("predictionData", JSON.stringify(data));
    } else {
      localStorage.removeItem("predictionData");
    }
    setPredictionDataState(data);
  };

  const clearPredictionData = () => {
    localStorage.removeItem("predictionData");
    setPredictionDataState(null);
  };

  return (
    <PredictionContext.Provider value={{ predictionData, setPredictionData, clearPredictionData }}>
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => useContext(PredictionContext);
