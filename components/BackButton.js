import styles from "../styles/BackButton.module.css";

export default function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className={styles.backButton}>
      <img
        src="/images/all/arrow_left_icon.svg"
        alt="返回"
        className={styles.arrowLeftIcon}
      />
    </button>
  );
}
