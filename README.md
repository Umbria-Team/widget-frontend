# Umbria Bridge Widget

## Features

The Umbria Bridge widget is a front-end to Umbria's Multi-blockchain, multi-asset low cost allowing people to move their assets from one blockchain to another quickly and cheaply. The front-end is a heavily modified version of Sushiswap. This codebase is limited to bridging and does not allow for pooling assets by users. If users want to pool assets, they should be directed to Umbria's site.

## Building

To build, please ensure you have NPM v6.14.15 and NodeJS v14.18.0. To easily manage different versions of NPM and NodeJS, we recommend using [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm/blob/master/README.md). For a package manager, we recommend using yarn. You can install by typing

`yarn install && yarn build && yarn dev`

This will spin up a development server that allowss you to live-edit code and have it re-build on the fly.

## How the bridge works

Under the hood, our bridge is fairly simple. When a user sends funds to one of our bridge addresses, an oracle listens for incoming payments on a number of networks on a given address. For each bi-directional bridge, there is a single address. As of the time of writing, the addresses are as follows

`0x4103c267Fba03A1Df4fe84Bc28092d629Fa3f422` (Ethereum <-> Polygon)
We are currently in the process of adding Binance Smart Chain.

Before sending, this codebase calls a numer of our back-end APIs to ensure that a transaction is supported (i.e. we have enough liquidity, it is a supported asset and the bridge is not under maintenance). In order to use these APIs, a key will be required on a per-project / per-domain basis to prevent abuse. You can get one of these by requesting it on our [discord](https://discord.umbria.network/)

After a user makes a payment is made and confirmed and our oracle detects the payment, the same amount (minus a fee) is sent back from our bridge wallet address back to the same address the payment was work, but on the other network. The fee is used to pay our liquidity providers, as well as the gas fee for us to send the transaction to the user.

## Support

The best place to reach us for support is our [discord](https://discord.umbria.network/).

## License
