import { FunctionComponent } from 'react';
import styles from './FilterDropDown.module.css';

interface FilterDropDownProps {
  onFilterChange: (filter: 'newest' | 'oldest') => void;
  onClose: () => void;
}

const FilterDropDown: FunctionComponent<FilterDropDownProps> = ({ onFilterChange, onClose }) => {
  const handleFilterClick = (filter: 'newest' | 'oldest') => {
    onFilterChange(filter);
    onClose();
  };

  return (
    <div className={styles.filterDropDown}>
      <div 
        className={styles.intelligenceCardTitle}
        onClick={() => handleFilterClick('newest')}
      >
        Newest
      </div>
      <div 
        className={styles.intelligenceCardTitle}
        onClick={() => handleFilterClick('oldest')}
      >
        Oldest
      </div>
    </div>
  );
};

export default FilterDropDown;
