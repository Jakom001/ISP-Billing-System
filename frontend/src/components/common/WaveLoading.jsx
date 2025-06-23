import React from 'react';

const WaveLoading = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-end">
        {/* Each letter with its own animation delay to create a wave effect */}
        {'Loading...'.split('').map((letter, index) => (
          <span 
            key={index}
            className="text-2xl font-bold text-primary inline-block animate-bounce"
            style={{
              animationDuration: '1s',
              animationDelay: `${index * 0.1}s`,
              animationIterationCount: 'infinite'
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WaveLoading;