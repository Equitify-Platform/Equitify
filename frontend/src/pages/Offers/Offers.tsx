import { parseUnits } from "@ethersproject/units";
import BN from "bn.js";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Countdown from "react-countdown";

import styles from "./style.module.scss";

import PlusSvg from "../../assets/icons/Plus.svg";
import RefreshSvg from "../../assets/icons/Refresh.svg";
import { Loader } from "../../components/Loader";
import SecondaryButton from "../../components/SecondaryButton";
import { NATIVE_DECIMALS } from "../../constants";
import { OfferCreatorType } from "../../contracts/equitifyPlatform";
import { Wallet } from "../../near-wallet";
import {
  acceptOfferFromGuaranteeProvider,
  acceptOfferFromNftProvider,
  cancelOrder,
  createOfferFromGuaranteeProvider,
  createOfferFromNftProvider,
  getOffers,
  getProtections,
  protectionClaimGuarantee,
  protectionClaimNft,
} from "../../store/actions/equitify.actions";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import {
  useAppDispatch,
  useLaunchpads,
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
      dispatch1(getLaunchpads(wallet)),
      dispatch1(getOffers(wallet)),
      dispatch1(getProtections(wallet)),
    ]).then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh(wallet, dispatch);
  }, [wallet, dispatch, refresh]);

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

  const filteredOffers = useMemo(
    () =>
      offers
        .filter((o) =>
          o.protection
            ? new Date(parseInt(o.protection.protectionStart) * 1000) <
              new Date()
            : true
        )
        .filter((o) =>
          o.nftContractId.toLowerCase().includes(nftAddress.toLowerCase())
        )
        .filter((o) => o.nftId.toLowerCase().includes(nftId.toLowerCase())),
    [offers, nftAddress, nftId]
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
                {filteredOffers.map((v) => (
                  <Offer
                    creatorType={v.offerCreatorType}
                    offerId={v.id}
                    nftAddress={v.nftContractId}
                    nftId={v.nftId}
                    name={`Offer ${v.id}`}
                    creator={v.offerCreatorId}
                    fee={v.nearFeeAmount}
                    guarantee={v.nearGuaranteeAmount}
                    key={v.id}
                    protectionStart=""
                    protectionDuration={v.protectionDuration}
                    stage={Stage.Opened}
                  />
                ))}
              </div>
            </>
          ) : tab === Tab.Protections ? (
            <>
              <div className={styles.opened}>Ready for Claim</div>
              <div className={styles.offers}>
                {filteredProtections
                  .filter(
                    (p) =>
                      new Date() >
                      new Date(
                        parseInt(p.protectionStart) * 1000 +
                          parseInt(p.offer.protectionDuration) * 1000
                      )
                  )
                  .map((v, i) => (
                    <Offer
                      creatorType={v.offer.offerCreatorType}
                      offerId={v.offerId}
                      nftAddress={v.offer.nftContractId}
                      nftId={v.offer.nftId}
                      name={`Offer ${v.offerId}`}
                      creator={v.offer.offerCreatorId}
                      fee={v.offer.nearFeeAmount}
                      guarantee={v.offer.nearGuaranteeAmount}
                      key={v.offerId}
                      protectionStart={v.protectionStart}
                      protectionDuration={v.offer.protectionDuration}
                      stage={Stage.Claim}
                    />
                  ))}
              </div>
              <div className={styles.waiting}>Waiting for Claim</div>
              <div className={styles.offers}>
                {filteredProtections
                  .filter(
                    (p) =>
                      new Date() <
                      new Date(
                        parseInt(p.protectionStart) * 1000 +
                          parseInt(p.offer.protectionDuration) * 1000
                      )
                  )
                  .map((v, i) => (
                    <Offer
                      creatorType={v.offer.offerCreatorType}
                      offerId={v.offerId}
                      nftAddress={v.offer.nftContractId}
                      nftId={v.offer.nftId}
                      name={`Offer ${v.offerId}`}
                      creator={v.offer.offerCreatorId}
                      fee={v.offer.nearFeeAmount}
                      guarantee={v.offer.nearGuaranteeAmount}
                      key={v.offerId}
                      protectionStart={v.protectionStart}
                      protectionDuration={v.offer.protectionDuration}
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
  offerId: string;
  name: string;
  creator: string;
  nftAddress: string;
  nftId: string;
  fee: string;
  guarantee: string;
  stage: Stage;
  protectionStart: string;
  protectionDuration: string;
  creatorType: OfferCreatorType;
}

const Offer: FC<OfferProps> = ({
  name,
  creator,
  fee,
  nftId,
  nftAddress,
  guarantee,
  stage,
  protectionStart,
  protectionDuration,
  offerId,
  creatorType,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countdownRef = useRef<any>(null);
  const { wallet } = useWallet();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (countdownRef.current && protectionDuration && protectionStart) {
      countdownRef.current.start();
    }
  }, [countdownRef.current, protectionStart, protectionDuration]);

  const cancelOrderClick = async () => {
    await dispatch(cancelOrder({ wallet, offer_id: offerId }));
  };

  const { projects } = useLaunchpads();

  const haveThisNft = () =>
    !!projects
      .find((p) => p.nft.address.toLowerCase() === nftAddress.toLowerCase())
      ?.nft.nfts.find((n) => n.tokenId === nftId);

  const acceptOrderClick = async () => {
    if (creatorType === OfferCreatorType.NFT_PROVIDER) {
      await dispatch(
        acceptOfferFromGuaranteeProvider({
          wallet,
          args: {
            offer_id: offerId,
            near_guarantee_amount: parseUnits(
              guarantee,
              NATIVE_DECIMALS
            ).toString(),
          },
        })
      );
    } else {
      await dispatch(
        acceptOfferFromNftProvider({
          wallet,
          args: {
            nft_id: nftId,
            offer_id: offerId,
            nft_contract_id: nftAddress,
            near_fee_amount: parseUnits(fee, NATIVE_DECIMALS).toString(),
          },
        })
      );
    }
  };

  const claimNft = async () => {
    await dispatch(protectionClaimNft({ wallet, offerId }));
  };

  const claimGuarantee = async () => {
    await dispatch(protectionClaimGuarantee({ wallet, offerId }));
  };

  const canClaim = () =>
    (wallet.accountId?.toLowerCase() === creator &&
      creatorType === OfferCreatorType.NFT_PROVIDER) ||
    (wallet.accountId?.toLowerCase() !== creator &&
      creatorType !== OfferCreatorType.NFT_PROVIDER);

  return (
    <div className={styles.offerWrapper}>
      <div className={styles.offerHeader}>
        <div className={styles.offerName}>{name}</div>
        <div className={styles.offerActions}>
          {stage === Stage.Waiting && (
            <div className={styles.timerLabel}>
              <Countdown
                now={Date.now}
                date={
                  new Date(
                    parseInt(protectionStart) * 1000 +
                      parseInt(protectionDuration) * 1000
                  )
                }
                renderer={({ formatted: f }) => (
                  <span>
                    {f.days}:{f.hours}:{f.minutes}:{f.seconds}
                  </span>
                )}
              />{" "}
              for Claim
            </div>
          )}
          {stage === Stage.Opened &&
            (creator.toLowerCase() === wallet.accountId?.toLowerCase() ? (
              <SecondaryButton
                isBlue={false}
                text="Cancel"
                isScalable={true}
                onClick={cancelOrderClick}
              />
            ) : wallet.accountId &&
              (creatorType === OfferCreatorType.NFT_PROVIDER ||
                (creatorType === OfferCreatorType.GUARANTEE_PROVIDER &&
                  haveThisNft())) ? (
              <SecondaryButton
                isBlue={true}
                text={`Accept as ${
                  creatorType === OfferCreatorType.GUARANTEE_PROVIDER
                    ? "as NFT provider"
                    : "as Guarantee provider"
                }`}
                onClick={acceptOrderClick}
                isScalable={true}
              />
            ) : null)}
          {stage === Stage.Claim &&
            (canClaim() ? (
              <>
                <SecondaryButton
                  isBlue={false}
                  text="Claim NFT"
                  onClick={claimNft}
                  isScalable={true}
                />
                <SecondaryButton
                  isBlue={true}
                  text="Claim Guarantee"
                  onClick={claimGuarantee}
                  isScalable={true}
                />
              </>
            ) : (
              <div className={styles.timerLabel}>
                Waiting for NFT provider to claim
              </div>
            ))}
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
  const dispatch = useAppDispatch();
  const { wallet } = useWallet();

  const createOffer = async () => {
    const args = {
      duration: new BN(parseInt(duration))
        .mul(new BN(60))
        .mul(new BN(1_000_000_000))
        .toString(),
      near_guarantee_amount: parseUnits(
        guaranteeAmount,
        NATIVE_DECIMALS
      ).toString(),
      near_fee_amount: parseUnits(feeAmount, NATIVE_DECIMALS).toString(),
      nft_contract_id: nftAddress,
      nft_id: nftId,
    };

    if (createAs === "nftBuyer") {
      await dispatch(
        createOfferFromGuaranteeProvider({
          wallet,
          args,
        })
      );
    } else {
      await dispatch(
        createOfferFromNftProvider({
          wallet,
          args,
        })
      );
    }
  };

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
          placeholder="Enter durations (minutes)"
          width="100%"
        />
        <div className={styles.modalButtons}>
          <SecondaryButton
            isBlue={false}
            text="Cancel"
            isScalable={true}
            onClick={() => setIsShow(false)}
          />
          <SecondaryButton
            isBlue={true}
            text="Create"
            isScalable={true}
            onClick={createOffer}
          />
        </div>
      </div>
    </div>
  ) : null;
};

export default Offers;
