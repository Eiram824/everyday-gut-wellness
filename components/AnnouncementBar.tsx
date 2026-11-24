import React from 'react';

interface AnnouncementBarProps {
  onOpenEBook: () => void;
}

const Item: React.FC = () => (
  <span className="ebar-item">
    <b>Free 7-Day Gut Reset eBook</b> &middot; Gentle daily habits, one small step at a time &middot; <u>Get it free</u>
  </span>
);

// Slow, gentle running bar for the free eBook. CSS-only marquee (see index.css);
// it stays still for people who prefer reduced motion and pauses on hover/focus.
const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onOpenEBook }) => (
  <a
    className="ebar"
    href="/#free-guide"
    aria-label="Get the free 7-Day Gentle Gut Reset eBook"
    onClick={(e) => {
      e.preventDefault();
      onOpenEBook();
    }}
  >
    <span className="ebar-track" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <Item key={i} />
      ))}
    </span>
  </a>
);

export default AnnouncementBar;
