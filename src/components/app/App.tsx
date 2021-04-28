import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Certificate,
  getUserCertificates,
  getSystemInfo,
  isValidSystemSetup,
  createAttachedSignature,
  createDetachedSignature,
  createHash,
} from "crypto-pro";
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

const getFormatNameCert = (cert: Certificate) => {
  return `${cert.subjectName}; выдан: ${getDateFormat(
    new Date(cert.validFrom)
  )}`;
};
//#endregion

const Item: React.FC = ({ children }) => {
  return <div className={styles.item}>{children}</div>;
};

export const App: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState("");

  const [certificateSelected, setCertificateSelected] = useState<number>(-1);

  const selectedCertificate = useMemo(() => certificates[certificateSelected], [
    certificateSelected,
    certificates,
  ]);

  const [subscribe, setSubscribe] = useState("");

  useEffect(() => {
    const getUserCert = async () => {
      try {
        const certificates = await getUserCertificates();
        setCertificates(() => certificates);

        /* const i = await isValidSystemSetup();
        console.log(i); */

        /* const r = await getSystemInfo();
        console.log(r); */
      } catch (er) {
        setError(() => er.message);
      }
    };

    getUserCert();
  }, []);

  const subscribeHandler = useCallback(async () => {
    if (!fileRef.current) {
      return;
    }

    const { 0: file } = fileRef.current.files ?? { 0: null };

    if (!file) {
      return;
    }

    if (!selectedCertificate) {
      return;
    }

    const arrayBuffer = await file.arrayBuffer();

    //#region Attached
    /* const subscribe = await createAttachedSignature(
      selectedCertificate.thumbprint,
      arrayBuffer
    ); */
    //#endregion

    //#region Detached
    const hash = await createHash(arrayBuffer);
    console.log("hash", hash);

    const subscribe = await createDetachedSignature(
      selectedCertificate.thumbprint,
      hash
    );
    //#endregion

    console.log("subscribe", subscribe);
    setSubscribe(() => subscribe);
  }, [selectedCertificate]);

  return (
    <div className={styles.container}>
      <Item>
        <select
          size={4}
          value={certificateSelected}
          onChange={(ev) => {
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
        {selectedCertificate && getFormatNameCert(selectedCertificate)}
      </Item>

      <Item>
        <input ref={fileRef} type="file" accept="application/pdf" />
      </Item>

      <Item>
        <button onClick={subscribeHandler}>Подписать</button>
      </Item>

      <Item>{subscribe}</Item>

      {error && <Item>{error}</Item>}
    </div>
  );
};
