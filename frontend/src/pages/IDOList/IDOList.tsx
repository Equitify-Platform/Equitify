import React from "react";

import styles from "./style.module.scss";

import IDOCard from "../../components/IDOCard/IDOCard";

function IDOList() {
  return (
    <div className="page-wrapper">
      <div>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industrs standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum.
      </div>
      <div className={styles.idoSection}>
        <IDOCard address={"111"} projectName={"Project name"} />
        <IDOCard address={"222"} projectName={"Project name 2"} />
        <IDOCard address={"333"} projectName={"Project name 3"} />
      </div>
    </div>
  );
}

export default IDOList;
