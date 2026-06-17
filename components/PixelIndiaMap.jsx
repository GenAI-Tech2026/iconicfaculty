import React from 'react';

const PixelIndiaMap = () => {
  const grid = [
    "           xx           ",
    "          xxxx          ",
    "           xx           ",
    "       xxxxxxxx         ",
    "      xxxxxxxxxx   xxx  ",
    "    xxxxxxxxxxxxxxxxxxx ",
    "  xxxxxxxxxxxxxxxxxxxxx ",
    " xxxxxxxxxxxxxxxxxxxxx  ",
    " xxxxxxxxxxxxxxxxxxx    ",
    "  xxxxxxxxxxxxxxxx      ",
    "   xxxxxxxxxxxxx        ",
    "    xxxxxxxxxxx         ",
    "     xxxxxxxxx          ",
    "      xxxxxxx           ",
    "       xxxxx            ",
    "        xxx             ",
    "         x              ",
    "         x              "
  ];

  return (
    <svg 
      viewBox="0 0 240 180" 
      style={{ width: '100%', height: '100%', opacity: 0.5 }}
    >
      {grid.map((row, y) => 
        row.split('').map((cell, x) => {
          if (cell === 'x') {
            return (
              <circle 
                key={`${x}-${y}`} 
                cx={x * 10 + 5} 
                cy={y * 10 + 5} 
                r="2" 
                fill="rgba(255, 255, 255, 0.4)" 
              />
            );
          }
          return null;
        })
      )}
      
      {/* Hyderabad Pin (approximate location) */}
      {/* Grid size is 24x18. Hyderabad is roughly in the middle-south. Let's put it at x=10, y=11 */}
      <circle 
        cx={10 * 10 + 5} 
        cy={11 * 10 + 5} 
        r="3" 
        fill="#ff5757" 
        style={{ filter: 'drop-shadow(0 0 4px #ff5757)' }}
      />
      <text
        x={10 * 10 + 15}
        y={11 * 10 + 8}
        fill="rgba(255, 255, 255, 0.6)"
        fontSize="8"
        letterSpacing="1"
        fontWeight="600"
      >
        HYDERABAD, INDIA
      </text>
    </svg>
  );
};

export default PixelIndiaMap;
