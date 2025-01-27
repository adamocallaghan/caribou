import React, { useEffect, useRef } from 'react';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base';
import { LOGIN_PROVIDER } from '@toruslabs/base-controllers';
import { PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const SocialLogin = () => {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [walletAddress, setWalletAddress] = React.useState('');
  const web3authRef = useRef<Web3AuthNoModal | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const clientId = "BIzmaRSq_wpNzDdwG29oAlwwAei3roesUUrWTtFUCmsALGQnC2YhlFYLzcRKut48UQBUOtAJKFepAzdhKRls6os";
        const chainId = "0x8274f";
        console.log('Chain ID:', chainId);
        console.log('Client ID:', clientId);

        if (!clientId) {
          throw new Error('Web3Auth Client ID is not configured');
        }

        const web3authInstance = new Web3AuthNoModal({
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: chainId,
            rpcTarget: "https://sepolia-rpc.scroll.io",
          },
          clientId: clientId,
          web3AuthNetwork: "testnet",
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: "testnet",
            clientId: clientId,
            uxMode: "popup",
          },
        });

        web3authInstance.configureAdapter(openloginAdapter);

        console.log("Starting Web3Auth initialization...");
        initializationPromiseRef.current = (async () => {
          try {
            await web3authInstance.init();
            console.log("Web3Auth initialized successfully");
            if (mounted) {
              web3authRef.current = web3authInstance;
              setIsInitialized(true);
            }
          } catch (err) {
            console.error("Web3Auth initialization failed:", err);
            throw err;
          }
        })();

        await initializationPromiseRef.current;
      } catch (error) {
        console.error('Web3Auth initialization error:', error);
        if (mounted) {
          setErrorMessage('Failed to initialize Web3Auth');
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const logout = async () => {
    if (!web3authRef.current) return;
    setWalletAddress('');
    try {
      await web3authRef.current.logout({ cleanup: true });
    } catch (e) {
      console.error(e);
    }
  };

  const loginWithProvider = async (loginProvider: string) => {
    if (!web3authRef.current || isConnecting || !isInitialized) {
      console.log("Early return conditions:", {
        noWeb3Auth: !web3authRef.current,
        isConnecting,
        notInitialized: !isInitialized
      });
      return;
    }

    setIsConnecting(true);
    setErrorMessage('');
    setWalletAddress('');

    try {
      console.log("Starting login process...");
      if (initializationPromiseRef.current) {
        console.log("Waiting for initialization to complete...");
        await initializationPromiseRef.current;
      }

      console.log("Connecting to provider:", loginProvider);
      await web3authRef.current.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        loginProvider,
        mfaLevel: 'none',
      });

      if (!web3authRef.current.provider) {
        throw new Error('No provider available');
      }

      const mappedProvider = new Web3WalletProvider(web3authRef.current.provider);
      await mappedProvider.refresh();

      const etherspotPrimeSdk = new PrimeSdk(mappedProvider, {
        chainId: ethers.BigNumber.from(chainId).toNumber()
      });

      const address = await etherspotPrimeSdk.getCounterFactualAddress();
      setWalletAddress(address);
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error?.message || 'Failed to login');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      {!isInitialized ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : walletAddress ? (
        <View style={styles.connectedContainer}>
          <Text style={styles.title}>Your address on Ethereum blockchain:</Text>
          <Text style={styles.address}>{walletAddress}</Text>
          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {isConnecting ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => loginWithProvider(LOGIN_PROVIDER.GOOGLE)}
              >
                <Text style={styles.buttonText}>Login with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => loginWithProvider(LOGIN_PROVIDER.GITHUB)}
              >
                <Text style={styles.buttonText}>Login with GitHub</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => loginWithProvider(LOGIN_PROVIDER.LINKEDIN)}
              >
                <Text style={styles.buttonText}>Login with LinkedIn</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectedContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default SocialLogin;
