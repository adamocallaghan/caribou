module.exports = {
  expo: {
    name: "caribou",
    // ... other existing expo config
    extra: {
      EXPO_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.EXPO_PUBLIC_WEB3AUTH_CLIENT_ID,
      EXPO_PUBLIC_WEB3AUTH_CHAIN_ID_HEX: process.env.EXPO_PUBLIC_WEB3AUTH_CHAIN_ID_HEX,
    },
  },
}; 