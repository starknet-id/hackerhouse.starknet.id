/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Button from "./components/button";
import { useEffect, useState } from "react";
import { useAccount, useStarknet, useConnectors } from "@starknet-react/core";
import { useStarknetExecute } from "@starknet-react/core";
import Wallets from "./components/wallets";
import SelectIdentity from "./components/selectIdentity";
import { TextField } from "@mui/material";
import { ec, hash } from "starknet";
import { Call } from "starknet/types";
import BN from "bn.js";

export default function Home() {
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [isNotMainnet, setIsNotMainnet] = useState<boolean>(false);
  const { library } = useStarknet();
  const { account } = useAccount();
  const [tokenId, setTokenId] = useState<string>("0");
  const [password, setPassword] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<BN>();
  const [passFailed, setPassFailed] = useState<boolean>(false);
  const { available, connect, disconnect } = useConnectors();
  const [isConnected, setIsConnected] = useState(false);
  const [callData, setCallData] = useState<Call[]>([]);
  const { execute } = useStarknetExecute({
    calls: callData as any,
  });

  useEffect(() => {
    if (passFailed) {
      setTimeout(() => {
        setPassFailed(false);
      }, 2000);
    }
  }, [passFailed]);

  useEffect(() => {
    const STARKNET_NETWORK = {
      mainnet: "0x534e5f4d41494e",
      testnet: "0x534e5f474f45524c49",
    };

    if (library.chainId != STARKNET_NETWORK.mainnet) {
      setIsNotMainnet(true);
    }
  }, [library]);

  useEffect(() => {
    if (callData)
      execute();
  }, [callData])

  function changeTokenId(value: string): void {
    setTokenId(value);
  }

  function changePassword(value: string): void {
    setPassword(value);
  }

  function updateCallData(
  ) {
    const actualTokenId = tokenId ? tokenId : Math.floor(Math.random() * 9999999999);
    const sbt_id = new BN(Math.floor(Math.random() * 9999999999));
    const hashed = hash.pedersen([sbt_id, actualTokenId]);
    const sbt_priv_key = new BN(Math.floor(Math.random() * 9999999999));
    const sbt_key = ec.getKeyPair(sbt_priv_key);
    const sbt_proof = ec.sign(sbt_key, hashed);
    const whitelist_sig = ec.sign(ec.getKeyPair(privateKey as BN), hashed);

    const calls = tokenId ? [] : [{
      contractAddress: process.env
        .NEXT_PUBLIC_STARKNETID_CONTRACT as string,
      entrypoint: "mint",
      calldata: [actualTokenId],
    }];
    calls.push({
      contractAddress: process.env
        .NEXT_PUBLIC_SBT_CONTRACT as string,
      entrypoint: "claim",
      calldata: [sbt_id.toString(), actualTokenId, ec.getStarkKey(sbt_key), sbt_proof[0], sbt_proof[1], whitelist_sig[0], whitelist_sig[1]],
    });
    setCallData(calls);
  }


  return (
    <>
      <Head>
        <title>Hacker House SBT</title>
        <meta name="description" content="Get your og domain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/starknetIdLogo.svg" />
      </Head>
      <main className={styles.main}>
        {/* <div className={styles.blackFilter}></div> */}
        <div className={styles.card}>
          <img
            className={styles.identityTokenImage}
            src="/starknet-building.webp"
            alt="SBT example"
          />
          <div className={styles.textSection}>
            {privateKey ? (
              <>
                <h1 className={styles.title}>It's almost done</h1>
                <div className="mt-5">
                  <SelectIdentity
                    tokenId={tokenId}
                    changeTokenId={changeTokenId}
                  />
                  <Button onClick={updateCallData}>
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
                  With Account Abstraction, SBTs on Starknet are broken. It's
                  the reason why the starknet.id team created the Identity
                  Token, a new standard for SBTs on Starknet. Be part of this
                  first experience on Starknet and mint your identity token for
                  the hacker house now !{" "}
                  <a
                    href="https://github.com/starknet-id/identity_tokens#readme"
                    className="underline cursor-pointer"
                  >
                    (Here is how it works)
                  </a>
                </p>
                <div className="mt-5 flex w-full">

                  {

                    isConnected ?

                      (<>
                        <TextField
                          fullWidth
                          type="password"
                          label={
                            passFailed
                              ? "Try again it's not the valid password"
                              : "Password"
                          }
                          placeholder="Password"
                          variant="outlined"
                          onChange={(e) => changePassword(e.target.value)}
                          error={passFailed}
                          required
                        />
                        <div className="ml-2">
                          <Button
                            onClick={() => {
                              const textAsBuffer = new TextEncoder().encode(password);
                              (async () => {
                                const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
                                const privateKey = (new BN(new Uint8Array(hashBuffer))).mod(new BN("3618502788666131213697322783095070105526743751716087489154079457884512865583"));
                                if (privateKey.clone().mod(new BN(5915587277)).toNumber() == 5122445791) {
                                  setPrivateKey(privateKey);
                                  setPassFailed(false);
                                } else {
                                  setPassFailed(true);
                                }
                              })();
                            }
                            }
                          >
                            Mint
                          </Button>
                        </div>
                      </>
                      )

                      : <>
                        <div className="w-full mr-0">
                          <Button
                            onClick={() => {
                              console.log(available)
                              if (available.length > 0) {
                                if (available.length === 1) {
                                  connect(available[0]);
                                  setIsConnected(true);
                                } else {
                                  setHasWallet(true);
                                }
                              } else {
                                setHasWallet(true);
                              }
                            }}

                          >
                            Connect
                          </Button>
                        </div>
                      </>
                  }

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
