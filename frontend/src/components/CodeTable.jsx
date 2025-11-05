import { useState } from 'react';

const CodeTable = ({ codes, isVisible }) => {
  const [sortBy, setSortBy] = useState('char'); // 'char', 'code', 'length', 'freq'
  const [searchTerm, setSearchTerm] = useState('');

  if (!codes || !isVisible || Object.keys(codes).length === 0) return null;

  // Convert codes object to array for sorting
  const codeArray = Object.entries(codes).map(([char, code]) => ({
    char,
    code,
    length: code.length,
    charCode: char.charCodeAt(0)
  }));

  // Filter by search term
  const filteredCodes = codeArray.filter(item => {
    if (!searchTerm) return true;
    return (
      item.char.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.includes(searchTerm)
    );
  });

  // Sort the codes
  const sortedCodes = [...filteredCodes].sort((a, b) => {
    switch (sortBy) {
      case 'char':
        return a.charCode - b.charCode;
      case 'code':
        return a.code.localeCompare(b.code);
      case 'length':
        return a.length - b.length;
      default:
        return 0;
    }
  });

  const averageLength = (
    codeArray.reduce((sum, item) => sum + item.length, 0) / codeArray.length
  ).toFixed(2);

  return (
    <div className="code-table-container">
      <div className="code-table-header">
        <div className="table-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
          </svg>
          Huffman Code Table
        </div>
        <div className="table-stats">
          <div className="stat-badge">
            <span className="stat-label">Characters:</span>
            <span className="stat-value">{codeArray.length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Avg Length:</span>
            <span className="stat-value">{averageLength} bits</span>
          </div>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search character or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortBy === 'char' ? 'active' : ''}`}
              onClick={() => setSortBy('char')}
            >
              Character
            </button>
            <button
              className={`sort-btn ${sortBy === 'code' ? 'active' : ''}`}
              onClick={() => setSortBy('code')}
            >
              Code
            </button>
            <button
              className={`sort-btn ${sortBy === 'length' ? 'active' : ''}`}
              onClick={() => setSortBy('length')}
            >
              Length
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="code-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Character</th>
              <th>ASCII</th>
              <th>Huffman Code</th>
              <th>Length</th>
              <th>Savings</th>
            </tr>
          </thead>
          <tbody>
            {sortedCodes.map((item, index) => {
              const savings = 8 - item.length;
              const savingsPercent = ((savings / 8) * 100).toFixed(1);

              return (
                <tr key={`${item.char}-${index}`} className="table-row">
                  <td className="row-number">{index + 1}</td>
                  <td className="char-cell">
                    <span className="char-display">
                      {item.char === ' ' ? '␣ (space)' :
                       item.char === '\n' ? '↵ (newline)' :
                       item.char === '\t' ? '⇥ (tab)' :
                       item.char}
                    </span>
                  </td>
                  <td className="ascii-cell">{item.charCode}</td>
                  <td className="code-cell">
                    <div className="code-bits">
                      {item.code.split('').map((bit, i) => (
                        <span
                          key={i}
                          className={`bit ${bit === '0' ? 'bit-zero' : 'bit-one'}`}
                          style={{
                            animationDelay: `${i * 0.05}s`
                          }}
                        >
                          {bit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="length-cell">
                    <span className="length-badge">{item.length} bits</span>
                  </td>
                  <td className="savings-cell">
                    <span className={`savings-badge ${savings > 0 ? 'positive' : savings < 0 ? 'negative' : 'neutral'}`}>
                      {savings > 0 ? '+' : ''}{savings} bits ({savingsPercent}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredCodes.length === 0 && (
        <div className="empty-state">
          <p>No results found for "{searchTerm}"</p>
        </div>
      )}

      <div className="table-footer">
        <div className="footer-info">
          <p>
            <strong>Note:</strong> Huffman coding assigns shorter codes to more frequent characters.
            Savings show the difference between standard 8-bit ASCII encoding and Huffman encoding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeTable;
