/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Button from "./components/button";
import { useEffect, useState } from "react";
import { useAccount, useStarknet } from "@starknet-react/core";
import Wallets from "./components/wallets";
import SelectIdentity from "./components/selectIdentity";
import { TextField } from "@mui/material";

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [isNotMainnet, setIsNotMainnet] = useState<boolean>(false);
  const { library } = useStarknet();
  const { account } = useAccount();
  const [tokenId, setTokenId] = useState<string>("0");
  const [password, setPassword] = useState<string>("");
  const [isRightPassword, setIsRightPassword] = useState<boolean>();

  useEffect(() => {
    const STARKNET_NETWORK = {
      mainnet: "0x534e5f4d41494e",
      testnet: "0x534e5f474f45524c49",
    };

    if (library.chainId != STARKNET_NETWORK.mainnet) {
      setIsNotMainnet(true);
    }
  }, [library]);

  function changeTokenId(value: string): void {
    setTokenId(value);
  }

  function changePassword(value: string): void {
    setPassword(value);
  }

  useEffect(() => {
    if (isRightPassword === false) {
      setTimeout(() => {
        setIsRightPassword(undefined);
      }, 2000);
    }
  }, [isRightPassword]);

  return (
    <>
      <Head>
        <title>Starknet Id: Og domains</title>
        <meta name="description" content="Get your og domain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/starknetIdLogo.svg" />
      </Head>
      <main className={styles.main}>
        {/* <div className={styles.blackFilter}></div> */}
        <div className={styles.card}>
          <img
            className={styles.identityTokenImage}
            src="/starknet-building.jpeg"
            alt="SBT example"
          />
          <div className={styles.textSection}>
            {isRightPassword === true ? (
              <>
                <h1 className={styles.title}>It's almost done</h1>
                <div className="mt-5">
                  <SelectIdentity
                    tokenId={tokenId}
                    changeTokenId={changeTokenId}
                  />
                  <Button
                    onClick={
                      account
                        ? () => setHasWallet(true)
                        : () => console.log("mint")
                    }
                  >
                    Mint my token
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className={styles.title}>
                  Get your Hacker House Identity Token
                </h1>
                <p className={styles.text}>
                  An Identity token is new standard for SBTs that permits it to
                  really be soulbound. Be part of this first experience on
                  Starknet and mint yours for the hacker house now !{" "}
                  <span className="underline">(Here is how it works)</span>
                </p>
                <div className="mt-5 flex w-full">
                  <TextField
                    fullWidth
                    type="password"
                    label={
                      isRightPassword === false
                        ? "Try again it's not the valid password"
                        : "Password"
                    }
                    placeholder="Password"
                    variant="outlined"
                    onChange={(e) => changePassword(e.target.value)}
                    error={isRightPassword === false}
                    required
                  />
                  <div className="ml-2">
                    <Button
                      onClick={
                        password === "keepStarknetStrange"
                          ? () => setIsRightPassword(true)
                          : () => setIsRightPassword(false)
                      }
                    >
                      Mint
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Wallets
          closeWallet={() => setHasWallet(false)}
          hasWallet={hasWallet}
        />
      </main>
    </>
  );
}