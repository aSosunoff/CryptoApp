import React, { useCallback, useEffect, useState } from "react";
import { Certificate, getUserCertificates } from "crypto-pro";
import styles from "./App.module.css";

//#region UTILS
const getDate = (date: Date) => {
  return {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),

    dayUTC: date.getUTCDate(),
    monthUTC: date.getUTCMonth(),
    yearUTC: date.getUTCFullYear(),
    hoursUTC: date.getUTCHours(),
    minutesUTC: date.getUTCMinutes(),
    secondsUTC: date.getUTCSeconds(),
  };
};

const getDateFormat = (date: Date) => {
  const { day, month, year, hours, minutes, seconds } = getDate(date);

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};
//#endregion

const Item: React.FC = ({ children }) => {
  return <div className={styles.item}>{children}</div>;
};

export const App: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState("");

  const [certificateSelected, setCertificateSelected] = useState<number>(-1);

  const getFormatNameCert = useCallback((cert: Certificate) => {
    return `${cert.subjectName}; выдан: ${getDateFormat(
      new Date(cert.validFrom)
    )}`;
  }, []);

  useEffect(() => {
    const getUserCert = async () => {
      try {
        const certificates = await getUserCertificates();
        /* debugger; */
        setCertificates(() => certificates);
      } catch (er) {
        setError(() => er.message);
      }
    };

    getUserCert();
  }, []);

  return (
    <div className={styles.container}>
      <Item>
        <select
          size={4}
          value={certificateSelected}
          onChange={(ev) => {
            console.log(1);

            setCertificateSelected(() => Number(ev.target.value));
          }}
        >
          <option value={-1}>Select certificate</option>

          {certificates.map((cert, index) => (
            <option key={index} value={index}>
              {getFormatNameCert(cert)}
            </option>
          ))}
        </select>
      </Item>

      <Item>
        Выбранный сертификат:&nbsp;
        {certificates[certificateSelected] &&
          getFormatNameCert(certificates[certificateSelected])}
      </Item>

      <Item>{error && <div>{error}</div>}</Item>
    </div>
  );
};
