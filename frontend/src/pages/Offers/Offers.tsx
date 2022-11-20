import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./style.module.scss";

import PlusSvg from "../../assets/icons/Plus.svg";
import RefreshSvg from "../../assets/icons/Refresh.svg";
import { Loader } from "../../components/Loader";
import SecondaryButton from "../../components/SecondaryButton";
import { Wallet } from "../../near-wallet";
import {
  getOffers,
  getProtections,
} from "../../store/actions/equitify.actions";
import {
  useAppDispatch,
  useOffers,
  useProtections,
  useWallet,
} from "../../store/hooks";

enum Tab {
  Offers,
  Protections,
  Cancelled,
}

const FilterInput: FC<{
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  placeholder: string;
  width?: string;
}> = ({ setValue, value, placeholder, width = "173px" }) => {
  return (
    <input
      className={styles.filterInput}
      type="text"
      width={width}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
    />
  );
};

function Offers() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [tab, setTab] = useState<Tab>(Tab.Offers);

  const [nftAddress, setNftAddress] = useState<string>("");
  const [nftId, setNftId] = useState<string>("");
  const offers = useOffers();
  const protections = useProtections();
  const { wallet } = useWallet();
  const dispatch = useAppDispatch();
  const [isShow, setIsShow] = useState<boolean>(false);

  const refresh = useCallback<
    (wallet: Wallet, dispatch1: typeof dispatch) => void
  >((wallet, dispatch1) => {
    setIsLoading(true);
    Promise.all([
      dispatch1(getOffers(wallet)),
      dispatch1(getProtections(wallet)),
    ]).then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh(wallet, dispatch);
  }, [wallet, dispatch, refresh]);

  const filteredOffers = useMemo(
    () =>
      offers
        .filter((o) =>
          o.nftContractId.toLowerCase().includes(nftAddress.toLowerCase())
        )
        .filter((o) => o.nftId.toLowerCase().includes(nftId.toLowerCase())),
    [offers, nftAddress, nftId]
  );

  const filteredProtections = useMemo(
    () =>
      protections
        .filter(
          (p) =>
            p.nftProviderId.toLowerCase() === wallet.accountId?.toLowerCase() ||
            p.guaranteeProviderId.toLowerCase() ===
              wallet.accountId?.toLowerCase()
        )
        .filter((p) =>
          p.nftProviderId.toLowerCase().includes(nftAddress.toLowerCase())
        )
        .filter((p) =>
          p.nftProviderId.toLowerCase().includes(nftId.toLowerCase())
        ),
    [protections, wallet.accountId, nftAddress, nftId]
  );

  return (
    <Loader isLoading={isLoading}>
      <div className="page-wrapper">
        <CreateOfferModal isShow={isShow} setIsShow={setIsShow} />
        <div className="content-wrapper">
          <div className={styles.topSection}>
            <h3>Offers</h3>
          </div>
          <div className={styles.navbar}>
            <div className={styles.nav}>
              <div
                onClick={() => setTab(Tab.Offers)}
                className={`${styles.navItem}${
                  tab === Tab.Offers ? ` ${styles.navActive}` : ""
                }`}
              >
                Offers
              </div>
              <div
                onClick={() => setTab(Tab.Protections)}
                className={`${styles.navItem}${
                  tab === Tab.Protections ? ` ${styles.navActive}` : ""
                }`}
              >
                Protections
              </div>
              {/*<div*/}
              {/*  onClick={() => setTab(Tab.Cancelled)}*/}
              {/*  className={`${styles.navItem}${*/}
              {/*    tab === Tab.Cancelled ? ` ${styles.navActive}` : ""*/}
              {/*  }`}*/}
              {/*>*/}
              {/*  Cancelled*/}
              {/*</div>*/}
            </div>
            <div
              className={styles.refresh}
              onClick={() => refresh(wallet, dispatch)}
            >
              <div className={styles.refreshLabel}>Refresh</div>
              <img src={RefreshSvg} alt="" />
            </div>
          </div>
          <div className={styles.filterBar}>
            <div className={styles.filters}>
              <FilterInput
                value={nftAddress}
                setValue={setNftAddress}
                placeholder="Enter NFT address"
              />
              <FilterInput
                value={nftId}
                setValue={setNftId}
                placeholder="Enter NFT ID"
                width="127px"
              />
            </div>
            <div>
              <SecondaryButton
                isBlue={false}
                text="Create new"
                isScalable={false}
                onClick={() => setIsShow(true)}
              >
                <img src={PlusSvg} alt="" />
              </SecondaryButton>
            </div>
          </div>
          {tab === Tab.Offers ? (
            <>
              <div className={styles.opened}>Opened</div>
              <div className={styles.offers}>
                {filteredOffers.map((v, i) => (
                  <Offer
                    nftAddress={v.nftContractId}
                    nftId={v.nftId}
                    name={`Offer ${i + 1}`}
                    creator={v.offerCreatorId}
                    fee={v.nearFeeAmount}
                    guarantee={v.nearGuaranteeAmount}
                    key={`${v.offerCreatorId}${v.nftContractId}${v.nftId}`}
                    stage={Stage.Opened}
                  />
                ))}
              </div>
            </>
          ) : tab === Tab.Protections ? (
            <>
              <div className={styles.opened}>Ready for Claim</div>
              <div className={styles.offers}>
                {filteredOffers.map((v, i) => (
                  <Offer
                    nftAddress={v.nftContractId}
                    nftId={v.nftId}
                    name={`Offer ${i + 1}`}
                    creator={v.offerCreatorId}
                    fee={v.nearFeeAmount}
                    guarantee={v.nearGuaranteeAmount}
                    key={`${v.offerCreatorId}${v.nftContractId}${v.nftId}`}
                    stage={Stage.Claim}
                  />
                ))}
              </div>
              <div className={styles.waiting}>Waiting for Claim</div>
              <div className={styles.offers}>
                {filteredOffers.map((v, i) => (
                  <Offer
                    nftAddress={v.nftContractId}
                    nftId={v.nftId}
                    name={`Offer ${i + 1}`}
                    creator={v.offerCreatorId}
                    fee={v.nearFeeAmount}
                    guarantee={v.nearGuaranteeAmount}
                    key={`${v.offerCreatorId}${v.nftContractId}${v.nftId}`}
                    stage={Stage.Waiting}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Loader>
  );
}

enum Stage {
  Opened,
  Waiting,
  Claim,
}

interface OfferProps {
  name: string;
  creator: string;
  nftAddress: string;
  nftId: string;
  fee: string;
  guarantee: string;
  stage: Stage;
}

const Offer: FC<OfferProps> = ({
  name,
  creator,
  fee,
  nftId,
  nftAddress,
  guarantee,
  stage,
}) => {
  return (
    <div className={styles.offerWrapper}>
      <div className={styles.offerHeader}>
        <div className={styles.offerName}>{name}</div>
        <div className={styles.offerActions}>
          {stage !== Stage.Waiting && (
            <SecondaryButton
              isBlue={true}
              text={`${stage === Stage.Opened ? "Accept" : "Claim"}`}
              isScalable={true}
            />
          )}
        </div>
      </div>
      <div className={styles.offerDesc}>
        <div>
          <b>Creator:</b> {creator}
        </div>
        <div>
          <b>NFT address:</b> {nftAddress}
        </div>
        <div>
          <b>NFT ID:</b> {nftId}
        </div>
        <div>
          <b>Fee:</b> {fee} NEAR
        </div>
        <div>
          <b>Guarantee:</b> {guarantee} NEAR
        </div>
      </div>
    </div>
  );
};

interface CreateOfferModalProps {
  isShow: boolean;
  setIsShow: Dispatch<SetStateAction<boolean>>;
}

const CreateOfferModal: FC<CreateOfferModalProps> = ({ isShow, setIsShow }) => {
  const [nftAddress, setNftAddress] = useState<string>("");
  const [nftId, setNftId] = useState<string>("");
  const [feeAmount, setFeeAmount] = useState<string>("");
  const [guaranteeAmount, setGuaranteeAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [createAs, setCreateAs] = useState<string>("nftBuyer");

  return isShow ? (
    <div className={styles.overlay} onClick={() => setIsShow(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.createHeader}>Create new offer</div>
        <div className={styles.createAsLabel}>Create offer as</div>
        <div className={styles.createAs}>
          <div>
            <input
              type="radio"
              name="createAs"
              id="nftBuyer"
              value="nftBuyer"
              onChange={(e) => setCreateAs(e.target.value)}
              defaultChecked
            />
            <label htmlFor="nftBuyer">NFT Buyer</label>
          </div>
          <div>
            <input
              type="radio"
              name="createAs"
              id="nftProvider"
              value="nftProvider"
              onChange={(e) => setCreateAs(e.target.value)}
            />
            <label htmlFor="nftProvider">NFT Provider</label>
          </div>
        </div>
        <FilterInput
          value={nftAddress}
          setValue={setNftAddress}
          placeholder="Enter NFT address"
          width="100%"
        />
        <FilterInput
          value={nftId}
          setValue={setNftId}
          placeholder="Enter NFT ID"
          width="100%"
        />
        <FilterInput
          value={feeAmount}
          setValue={setFeeAmount}
          placeholder="Enter NEAR Fee amount"
          width="100%"
        />
        <FilterInput
          value={guaranteeAmount}
          setValue={setGuaranteeAmount}
          placeholder="Enter NEAR Guarantee amount"
          width="100%"
        />
        <FilterInput
          value={duration}
          setValue={setDuration}
          placeholder="Enter NFT address"
          width="100%"
        />
        <div className={styles.modalButtons}>
          <SecondaryButton
            isBlue={false}
            text="Cancel"
            isScalable={true}
            onClick={() => setIsShow(false)}
          />
          <SecondaryButton isBlue={true} text="Create" isScalable={true} />
        </div>
      </div>
    </div>
  ) : null;
};

export default Offers;
