/**
 * Empty-state art for the host dashboard: an open book lying at an angle with a pink ribbon.
 * Drawn for this project (simple shapes, not Airbnb's artwork) at Airbnb's measured 260×196 size.
 */
export function BookIllustration() {
  // Text lines on each page follow the page's curve; drawn once and mirrored for the right page.
  const lines = [0, 13, 26, 39];
  return (
    <svg viewBox="0 0 260 196" width="260" height="196" aria-hidden className="shrink-0">
      <g transform="rotate(-9 130 112)">
        {/* soft shadow under the book */}
        <ellipse cx="132" cy="174" rx="102" ry="10" fill="#000" opacity="0.07" />
        {/* cover, slightly larger than the pages */}
        <path d="M20 70 L130 100 L240 70 L242 144 L130 174 L18 144 Z" fill="#C8BFB2" stroke="#B3A998" strokeWidth="1.5" strokeLinejoin="round" />
        {/* page block thickness */}
        <path d="M26 66 L130 96 L234 66 L234 140 L130 166 L26 140 Z" fill="#EDE7DD" />
        {/* left and right pages, curving down into the spine */}
        <path d="M30 60 C72 49 106 60 130 88 L130 158 C106 133 72 126 30 138 Z" fill="#FBF8F2" stroke="#E2DACE" strokeWidth="1.5" />
        <path d="M230 60 C188 49 154 60 130 88 L130 158 C154 133 188 126 230 138 Z" fill="#FFFFFF" stroke="#E2DACE" strokeWidth="1.5" />
        {/* shading along the spine */}
        <path d="M130 88 L130 158" stroke="#DCD3C6" strokeWidth="3" />
        <g fill="none" stroke="#D6CEC2" strokeWidth="3" strokeLinecap="round">
          {lines.map((dy, i) => (
            <path key={`l${dy}`} d={`M${46 + i * 2} ${78 + dy} C${70} ${71 + dy} ${94} ${77 + dy} ${114 - i * 3} ${92 + dy}`} />
          ))}
          {lines.map((dy, i) => (
            <path key={`r${dy}`} d={`M${214 - i * 2} ${78 + dy} C${190} ${71 + dy} ${166} ${77 + dy} ${146 + i * 3} ${92 + dy}`} />
          ))}
        </g>
        {/* pink ribbon hanging from the spine over the bottom edge */}
        <path d="M125 150 C123 162 131 170 125 190 L133 183 L141 191 C139 172 145 160 137 150 Z" fill="#FF385C" />
        <path d="M131 150 C129 162 137 170 133 183 L141 191 C139 172 145 160 137 150 Z" fill="#D70466" opacity="0.35" />
      </g>
    </svg>
  );
}
