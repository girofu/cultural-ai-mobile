import styles from "../styles/MenuButton.module.css";

export default function MenuButton({ onClick }) {
  return (
    <button className={styles.menuButton} onClick={onClick}>
      <img
        src="/images/all/menu_icon.svg"
        alt="選單"
        className={styles.menuIcon}
      />
    </button>
  );
}
