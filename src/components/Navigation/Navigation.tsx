import React from "react";
import styles from "./Navigation.module.css";
import { SectionId } from "@/hooks/useHashNavigation";

interface NavigationProps {
  activeSection: SectionId | null;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => void;
}

const NAV_ITEMS: Array<{ id: SectionId; label: string }> = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Say hi" },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onNavigate,
}) => {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main Navigation">
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeSection === item.id;
            return (
              <React.Fragment key={item.id}>
                {idx > 0 && (
                  <li aria-hidden="true" className={styles.separator}>
                    ·
                  </li>
                )}
                <li>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => onNavigate(e, item.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={`${styles.navLink} ${
                      isActive ? styles.navLinkActive : ""
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};
