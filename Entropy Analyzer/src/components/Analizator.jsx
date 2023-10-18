import React, { useState } from 'react';
import style from './Analizator.module.css';

function calculateEntropy(data) {
  const bitCounts = {
    0: 0,
    1: 0,
  };
console.log(data.length)
  for (let i = 0; i < data.length; i++) {
    const bit = data[i];
    bitCounts[bit] += 1;
  }
console.log(bitCounts)
  const totalBits = data.length;
  const probabilities = {};
  for (let bit in bitCounts) {
    probabilities[bit] = bitCounts[bit] / totalBits;
  }
console.log (probabilities)
  let entropy = 0;
  for (let bit in probabilities) {
    const probability = probabilities[bit];
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }
  console.log(entropy)
  let maxEntropy = Math.log2(data.length)


  const relativeEntropy = entropy / maxEntropy;

  return { entropy, maxEntropy, relativeEntropy };
}

function calculateTransitionMatrix(binaryData, subsequenceLength) {
  const transitionMatrix = new Array(16).fill(0).map(() => new Array(16).fill(0));

  const subsequenceCount = 1 << subsequenceLength;

  for (let i = 0; i < binaryData.length - subsequenceLength; i++) {
    const currentSubsequence = parseInt(binaryData.slice(i, i + subsequenceLength), 2);
    const nextSubsequence = parseInt(binaryData.slice(i + subsequenceLength, i + 2 * subsequenceLength), 2);

    transitionMatrix[currentSubsequence][nextSubsequence]++;
  }

  // Normalize transition probabilities
  for (let i = 0; i < subsequenceCount; i++) {
    const totalTransitions = transitionMatrix[i].reduce((acc, count) => acc + count, 0);
  
    if (totalTransitions !== 0) {
      for (let j = 0; j < subsequenceCount; j++) {
        transitionMatrix[i][j] /= totalTransitions;
      }
    }
  }

  return transitionMatrix;
}

function Analizator() {
  const [fileData, setFileData] = useState(null);
  const [entropyInfo, setEntropyInfo] = useState(null);
  const [transitionMatrix, setTransitionMatrix] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const fileBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);

      const binaryData = Array.from(uint8Array)
        .map((byte) => byte.toString(2).padStart(8, '0'))
        .join('');

      const subsequenceLength = 4;

      const entropyData = calculateEntropy(binaryData);
      const transitionMatrix = calculateTransitionMatrix(binaryData, subsequenceLength);

      setFileData(binaryData);
      setEntropyInfo(entropyData);
      setTransitionMatrix(transitionMatrix);
    }
  };

  return (
    <div className={style.container}>
      <input type="file" onChange={handleFileChange} />
      {fileData && (
        <div className={style.resultContainer}>
          <div className={style.title}>Двоичная последовательность файла:</div>
          <textarea cols="4" rows="30" className={style.binaryData}>{fileData}</textarea>
          <div className={style.valueContainer}>
            <div className={style.valueItem}>
              <p className={style.title}>Текущая <br /> энтропия:</p>
              <p className={style.value}>{entropyInfo.entropy}</p>
            </div>
            <div className={style.valueItem}>
              <p className={style.title}>Максимальная энтропия:</p>
              <p className={style.value}>{entropyInfo.maxEntropy}</p>
            </div>
            <div className={style.valueItem}>
              <p className={style.title}>Относительная энтропия:</p>
              <p className={style.value}>{entropyInfo.relativeEntropy}</p>
            </div>
          </div>
          {transitionMatrix && (
            <div className={style.transitionMatrix}>
              <h1>Вероятностная схема (матрица 16x16):</h1>
              <table className={style.table}>
                <thead>
                  <tr>
                    <th></th>
                    {Array.from(Array(16).keys()).map((bit) => (
                      <th key={bit}>{bit.toString(2).padStart(4, '0')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transitionMatrix.map((row, index) => (
                    <tr key={index}>
                      <td>{index.toString(2).padStart(4, '0')}</td>
                      {row.map((probability, j) => (
                        <td key={j}>{probability.toFixed(4)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Analizator;
