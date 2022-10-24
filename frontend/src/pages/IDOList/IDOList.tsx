import React, { useEffect } from "react";

import styles from "./style.module.scss";

import IDOCard from "../../components/IDOCard/IDOCard";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpads } from "../../store/hooks";

function IDOList() {
  const dispatch = useAppDispatch();
  const launchpads = useLaunchpads();

  useEffect(() => {
    dispatch(getLaunchpads());
  }, [dispatch]);

  return (
    <div className={styles.idoListPage}>
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
        {launchpads.projects.map((p) => (
          <IDOCard key={p.address} />
        ))}
      </div>
    </div>
  );
}

export default IDOList;
