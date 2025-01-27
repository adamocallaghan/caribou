import React, { useEffect, useRef } from 'react';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base';
import { LOGIN_PROVIDER } from '@toruslabs/base-controllers';
import { PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import { ethers } from 'ethers';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

const SocialLogin = () => {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [walletAddress, setWalletAddress] = React.useState('');
  const web3authRef = useRef<Web3AuthNoModal | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log('Chain ID:', process.env.EXPO_PUBLIC_WEB3AUTH_CHAIN_ID_HEX);
        console.log('Client ID:', process.env.EXPO_PUBLIC_WEB3AUTH_CLIENT_ID);

        const web3authInstance = new Web3AuthNoModal({
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: process.env.EXPO_PUBLIC_WEB3AUTH_CHAIN_ID_HEX || '0x1',
          },
          clientId: process.env.EXPO_PUBLIC_WEB3AUTH_CLIENT_ID || '',
        });

        const openloginAdapter = new OpenloginAdapter();
        web3authInstance.configureAdapter(openloginAdapter);
        await web3authInstance.init();
        
        if (mounted) {
          web3authRef.current = web3authInstance;
          setIsInitialized(true);
        }
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
    if (!web3authRef.current || isConnecting || !isInitialized) return;
    setIsConnecting(true);
    setErrorMessage('');
    setWalletAddress('');

    try {
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
        chainId: ethers.BigNumber.from(process.env.EXPO_PUBLIC_WEB3AUTH_CHAIN_ID_HEX as string).toNumber()
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
