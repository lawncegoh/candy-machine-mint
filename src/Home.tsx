import './Home.css';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Countdown from 'react-countdown';
import { Button, CircularProgress, Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import * as anchor from '@project-serum/anchor';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import bg from './assets/platys_banner_flicker.gif';
import logo from './assets/animated-logo.gif';
import showcase from './assets/updated_showcase.gif';

import {
	CandyMachine,
	awaitTransactionSignatureConfirmation,
	getCandyMachineState,
	mintOneToken,
} from './candy-machine';

type StartProps = {
	currentWidth: number;
};

type buttonProps = {
	isMobile: boolean;
};

const StartContainer = styled.div<StartProps>`
	background-image: url('${bg}');
	background-size: 100%;
	background-repeat: no-repeat;
	width: 100%;
	image-rendering: pixelated;
	height: ${(props) => (props.currentWidth / 100) * 55.8}px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	@media (max-width: 768px) {
		background-image: none;
	}
`;

const ConnectButton = styled(WalletDialogButton)`
	&.MuiButton-containedPrimary {
		font-family: Pixel;
		background-color: #2c3e50;
		border: 1px solid black;
		box-shadow: 3px 3px black;
		&:hover {
			background-color: #212f3d;
			cursor: pointer;
		}

		&:active {
			box-shadow: 1px 1px black;
			transform: translateY(2px);
		}

		span {
			flex-direction: column;
			font-size: 40px;
			padding: 10px;

			@media (max-width: 768px) {
				font-size: 20px;
			}
		}
	}
`;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 30px;
`; // add your styles here

const Header = styled.div`
	border-bottom: 1px solid black;
	width: 100%;
	display: flex;
	flex-direction: row;
	padding-left: 2px;
	padding-bottom: 5px;
`;

const CloseIcon = styled.div`
	background-color: #fe6058;
	border-radius: 50%;
	height: 8px;
	width: 8px;
	margin-right: 1px;

	@media (max-width: 768px) {
		height: 8px;
		width: 8px;
	}
`;

const MinimizeIcon = styled.div`
	background-color: #ffbf2e;
	border-radius: 50%;
	height: 8px;
	width: 8px;
	margin-right: 1px;

	@media (max-width: 768px) {
		height: 8px;
		width: 8px;
	}
`;

const MaximizeIcon = styled.div`
	background-color: #28c840;
	border-radius: 50%;
	height: 8px;
	width: 8px;
	margin-right: 1px;

	@media (max-width: 768px) {
		height: 8px;
		width: 8px;
	}
`;
const MintButton = styled(Button)<buttonProps>`
	&.MuiButton-root {
		font-family: Pixel;
		background-color: #2c3e50;
		border: 1px solid black;
		box-shadow: 3px 3px black;
		color: white;
		width: 200px;
		&:hover {
			background-color: #212f3d;
			cursor: pointer;
		}

		&:active {
			box-shadow: 1px 1px black;
			transform: translateY(2px);
		}
	}

	span {
		flex-direction: column;
		font-size: 20px;
		padding: 10px;
	}
`; // add your styles here

export interface HomeProps {
	candyMachineId: anchor.web3.PublicKey;
	config: anchor.web3.PublicKey;
	connection: anchor.web3.Connection;
	startDate: number;
	treasury: anchor.web3.PublicKey;
	txTimeout: number;
}

const LAUNCH_DATE = new Date(Date.UTC(2021, 10, 29, 16));

const WL_DATE = new Date(Date.UTC(2021, 10, 29, 15, 30));

const WL = [
	'Qn7UYmMFgfeQDshWafGbFU8vgKwNwZ5GDnt2gXakYP1',
	'4T6X1vEbtBoMrae5mq5F1VjptxBc945TgC57kG4jnr1F',
	'8GA1KgqRHHDFdT8F5nXbHAiPmH8UX9mmCc2jtFQjGWE6',
	'7EJb93yNNRHjYwNbkj6vFU9wxZXAoA7mwWGyqVbuKrTg',
	'5qkjCdFSMmWkW9f867ii2m6dkgGeaADqftcrMhCBSKow',
	'7EQzL6AKLTaXqZbMKFZ311nBccmHQbTUBNAComCNNAnu',
	'AcmF1XJXrNyBrYsNqe7DE2mhY3U8awoNSnXWYWVX98kA',
	'DNEx4d3PRcPqeTpXApxE1vhuE89nuRmpngkPhFPHEw3x',
	'EP1e4JP4gG1y5TFzBFrk9rR5LVZ5LcwDEfkGMaiJk6Bi',
	'9dCmr4PKJJ7vTwLDApBZczPJfv9AtzUxwDvUHqjk9tQN',
	'DLz7csFxyT9oQ3CJ2Y56gejgc5FuQY46Sf7XQyYGBbeT',
	'Fr7a7yoAU5Eh8KzvDffRFw5tc2VBavZ5GtbTSmBWcP76',
	'3ZZYeiipHHNhRuHW7VpZVyK7KfgjpCjEUTBDs4kD5Pn4',
	'BpQxqk5xbH9R3DTYZbkkruQFKTUwjzfR666ayYGEQbRe',
	'F6rxTNuFLXeCj4tWjfeJCYHM8r9DMcqFCKFLSnzMJpD6',
	'66qbPsXAkR9v398T32NfPRGwCzL4AQNmywr1CYYuKRHV',
	'2CJ3DxrD887JsTifuFqy8hVAfuqziUVYWr9CAyiJy6dn',
	'G5isLhJns1FJq8FCLGo1NYeJM6NoNDACUmsbLPSvQfEZ',
	'FLRPSFatBqPM949g7FbPePc4NPM2KNe3MpKXUwaCWzrk',
	'BUQc7SGrWqQKd1hKgpLDPcmBwR8XULijEVSTENosDeDY',
	'7brhaLwDMV2myi4wKyeZhBU3fB6hdu8oP5Nkj1P7b19d',
	'Bm437XdQqqE9F7fnBVfYt9qtAqH4UYQsAfwLQ3sZzThj',
	'G6PW5raRKzM3wdMZVCbphNUweiwqXwcRXhAsWpJDqRyB',
	'4sekonqvCjaNrWbVsQWh24PnvRcjMNPbf22tnLvf9gEM',
	'AuDSfhvgnCXRyhgPv67etVb7sPn1qrRYev4GHKodpFps',
	'7a2xfcSm18cEq7E9shBpyhtt9N3peSoUXsbm34vs1wH',
	'EssapgUQjzkqPEWsjNedAiAtryiYwUeHo1kpLogv4Aup',
	'BNCJS5abThfFPT258XTaW6zYsi3BGGoF5Eq2JqCDBKtM',
	'D6br5rfg3DNfRX4hY2ZKEuwzDJeCaabKmhjeehSRCZj9',
	'F61apucQXw7559j4BRV7mMia8Fb1UtbPHL6N2ff6mXAY',
	'Do9n5Rw932qAHZ5hhY7VpTppxdw4LqkpPG6AqLk2zfRj',
	'29kHKavCRFWBCcTxPS3kZREhxRUXG2LYRxub73D2diA4',
	'7he4rJ9zxo43qpu3nC8JsAs9fba3iuykVHahqmGH9UFa',
	'14ow2BL1AK6G4CfZSVWgBHVyRFtz2QNNyHSWAf78bBHi',
	'EHFcWBEc3bNMxsN8fVaEWghEapVnJbdZ2U5s21n2STR7',
	'8dzBi34nLNy8wq8XZRp9tKdv5oJ1sEzy7Zmnen6Ame7J',
	'HPncmhtTxhFAW9PFNmYfWKa6R9UyVEP3brrGjwWgMBjy',
	'73qSVQBe4u5YfXV11Ag2aSQoKKAef2ygJWbtJyHskpc6',
	'FK5TNMg1t6vcXEa5EknFC4c6egCp6ycSYuVLQSHVK2T7',
	'5pUKGtPmBf7BseiKYA6u6jXFFARhB5moGKBKAv3cv28Q',
	'4VAx5Yqv3GLv3nr4XXWzLu84y8o4oF6HMkRNAkTUzWiP',
	'6eVkCivCTNcPimAsZpCyqzLPAqTePWJFWxsNrJfhrHEN',
	'7S4Gv1EtYeMkXgmwxMirUV3gdaWAdKHFo2SMP3BWCnSb',
	'A1q6SsU6MizApdwNQSBwcBSZSxssveLWRiaWy5wRjWEZ',
	'AE1tyZXYG27d95P597cKo9Nc5UKDcwwxkbLtUxp2abTg',
	'ExZCH3qfaEHV9nzxpef1BQ1F46ePKQwZ9hSWGXU9u7AG',
	'GYuBYC6UzXUFTHdj9Mzosp5Lf4cV4pmW7zFfjYgjZeHL',
	'3q9TGfoLBM9743Uhp5TZbs4mMxwhbo5r249pHGdmNL4L',
	'2rrzgsMiDnqczUhpt8cvNXXMkQvVo5kkJaXeFvURMdEg',
	'89xHZYi1sUsh7fPqDpQvJFYQCzNNFXSaQAtZuts7GVT4',
	'BNks6g8YKr3zAUfBbQC5GTL6G5EU6WuNmo4vmw22dU5i',
	'75YaybBnwBVFBBLMoZQETHT38sazci8Ai2AQbwTFLQ64',
	'ALRGAa7cAbDKmgxtABuAFRCick6Gku5kUc1XUq8U1fbM',
	'6gv1R1bPVS12AXu656wQCtMT1chaMEPKoznZTQ6yMmhe',
	'2BYVuxmrBsbD1m9okuVEjNGs2L3qZpUxtptx47JJ2x5F',
	'GLiV1njMSJ6kwQn5ZY2cgXv8rXwdSWecDzgj8q4jM9mc',
	'8bCFqa2vsjXFUztGkbxyasBBaCdT44qW4rdDXvzkMbtf',
	'7EuG8nMrCbJ6mTh4UhrkAyotPoDCRqZDdVXzGra6qskk',
	'3znBCtXpWpNBqWtujgv3myah5RhzxkAi6ZkBgQ5wGfqk',
	'3DJfygNUDBKzBYdRnDrcuZtwFbDrPEaj13TQosCMa5m8',
	'4Qy8RKc8rHU8DqLp9Eg7Wr6VebXZ3XY76KKMnQgpgXJR',
	'Et9v2GAbA5ypptNtGv8ND51wMuaA9WJA8efjECabbgAP',
	'3e5uNSHCUThj4xWCQrzBgbqwzzdb3CSSSBvxdND8SBDM',
	'HN4TjVF1sPSZXDFxCDa6tp5CMVKTyU2CGECJTGGdNeUP',
	'E9ktJbHy5TDCdwFMv7JGNu34mpLCGrFwh2uSKg8WkhRm',
	'FzeME3R5hzEtnPbHNATpkLnpneJvEqpNj7TNDAF7TND1',
	'4ThTb3ucQXe8NLQsHmTv9ah37uigFuPqGLwQAZHUFGe5',
	'0xF5743816C9F87A7b20aE3A48741dD0AB3bf39c9d',
	'4Qa9FyeJwUXRT9gxFuzjoo1T2GT9jZL9CGqrLpAhMDwU',
	'Qn7UYmMFgfeQDshWafGbFU8vgKwNwZ5GDnt2gXakYP1',
	'DB7Z4ve1nVfZ76x5CzUdBCxdPyVFESwDok451NSuSbdR',
	'GUZwkJvCycHeicAxKV151PfzGL5DP9e91LGK6jqqGQ1J',
	'4ZKMB976hXGepdvqMui8SysNXFcDefEGFRXc11ZDEeE3',
	'7fE3QMzz4h7bsf917gepFc7DC6Njg9vHfwBoDJCgksN9',
	'AY83RwBcM7vM5xpNyuGTKT6PDwjMv4emvDmX8AD5cKkr',
	'4ThTb3ucQXe8NLQsHmTv9ah37uigFuPqGLwQAZHUFGe5',
	'3r2wdYuYMjzgYs3KZNtRrTemWdG9VZj8qQpzAddvbJLK',
	'u8pRXHHapsWxjwzbF6fogcX938j4YBRwX7xeoZ29i1k',
	'5GwYJwg4eMoMZgY8EP22R4X9cWtYa3BvK9wEGqyRhbEy',
];

const Home = (props: HomeProps) => {
	const [isActive, setIsActive] = useState(false); // true when countdown completes
	const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
	const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
	const [disableMint, setDisableMint] = useState(true);
	const [walletAddress, setWalletAddress] = useState('');
	const [itemsAvailable, setItemsAvailable] = useState(0);
	const [itemsRedeemed, setItemsRedeemed] = useState(0);

	const [alertState, setAlertState] = useState<AlertState>({
		open: false,
		message: '',
		severity: undefined,
	});

	function getWindowDimensions() {
		const { innerWidth: width, innerHeight: height } = window;
		return {
			width,
			height,
		};
	}

	const [windowDimensions, setWindowDimensions] = useState(
		getWindowDimensions()
	);

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	let isMobile = windowDimensions.width <= 768;

	const dateInPast = (firstDate: Date) => {
		let today = new Date();

		if (firstDate.getTime() <= today.getTime()) {
			return true;
		}

		return false;
	};

	const checkInWL = (addy: string) => {
		return WL.includes(addy);
	};
	useEffect(() => {
		const whitelisted = checkInWL(walletAddress);

		const whiteListStarted = dateInPast(WL_DATE);

		const publicStarted = dateInPast(LAUNCH_DATE);

		const canMint = (whitelisted && whiteListStarted) || publicStarted;

		if (canMint) {
			setDisableMint(false);
		}
	}, [walletAddress]);

	const [startDate, setStartDate] = useState(new Date(props.startDate));

	const wallet = useAnchorWallet();
	const [candyMachine, setCandyMachine] = useState<CandyMachine>();

	const refreshCandyMachineState = () => {
		(async () => {
			if (!wallet) return;

			const {
				candyMachine,
				goLiveDate,
				itemsAvailable,
				itemsRemaining,
				itemsRedeemed,
			} = await getCandyMachineState(
				wallet as anchor.Wallet,
				props.candyMachineId,
				props.connection
			);
			setWalletAddress(wallet.publicKey.toString());

			setItemsAvailable(itemsAvailable);
			setItemsRedeemed(itemsRedeemed);

			setIsSoldOut(itemsRemaining === 0);
			setStartDate(goLiveDate);
			setCandyMachine(candyMachine);
		})();
	};

	const onMint = async () => {
		if (itemsRedeemed >= 1111) {
			return;
		}

		try {
			setIsMinting(true);
			if (wallet && candyMachine?.program) {
				const mintTxId = await mintOneToken(
					candyMachine,
					props.config,
					wallet.publicKey,
					props.treasury
				);

				const status = await awaitTransactionSignatureConfirmation(
					mintTxId,
					props.txTimeout,
					props.connection,
					'singleGossip',
					false
				);

				if (!status?.err) {
					setAlertState({
						open: true,
						message: 'Congratulations! Mint succeeded!',
						severity: 'success',
					});
				} else {
					setAlertState({
						open: true,
						message: 'Mint failed! Please try again!',
						severity: 'error',
					});
				}
			}
		} catch (error: any) {
			// TODO: blech:
			let message = error.msg || 'Minting failed! Please try again!';
			if (!error.msg) {
				if (error.message.indexOf('0x138')) {
				} else if (error.message.indexOf('0x137')) {
					message = `SOLD OUT!`;
				} else if (error.message.indexOf('0x135')) {
					message = `Insufficient funds to mint. Please fund your wallet.`;
				}
			} else {
				if (error.code === 311) {
					message = `SOLD OUT!`;
					setIsSoldOut(true);
				} else if (error.code === 312) {
					message = `Minting period hasn't started yet.`;
				}
			}

			setAlertState({
				open: true,
				message,
				severity: 'error',
			});
		} finally {
			setIsMinting(false);
			refreshCandyMachineState();
		}

		// if in wl
	};

	useEffect(refreshCandyMachineState, [
		wallet,
		props.candyMachineId,
		props.connection,
	]);

	console.log(itemsAvailable);

	return (
		<main>
			<StartContainer currentWidth={windowDimensions.width}>
				{!wallet && (
					<img
						src={logo}
						width={isMobile ? '250px' : '400px'}
						alt='logo'
					/>
				)}
				<div
					style={{
						backgroundColor: 'cornsilk',
						paddingTop: isMobile ? '0px' : '15px',
						paddingBottom: isMobile ? '0px' : '15px',
						paddingLeft: '100px',
						paddingRight: '100px',
						border: isMobile ? 'none' : '3px solid black',
						boxShadow: isMobile ? 'none' : '3px 3px black',
						width: isMobile ? '100%' : 'auto',
					}}
				>
					{wallet && (
						<>
							<div style={{ width: '100%' }}>
								<p style={{ fontSize: '50px' }}>Mint a Platy</p>
								<img
									src={showcase}
									width='200px'
									alt='showcase'
								/>
								<p>0.18 SOL each, wodo wodo ~</p>

								<p>
									Platys Minted: {itemsRedeemed}/{1111}
								</p>
							</div>
						</>
					)}

					<MintContainer>
						{!wallet ? (
							<ConnectButton>
								<Header>
									<CloseIcon />
									<MinimizeIcon />
									<MaximizeIcon />
								</Header>
								Connect Wallet
							</ConnectButton>
						) : (
							<>
								<MintButton
									disabled={
										isSoldOut ||
										isMinting ||
										!isActive ||
										disableMint
									}
									onClick={onMint}
									variant='contained'
									isMobile={isMobile}
								>
									<Header>
										<CloseIcon />
										<MinimizeIcon />
										<MaximizeIcon />
									</Header>
									{isSoldOut ? (
										'SOLD OUT'
									) : isActive ? (
										isMinting ? (
											<CircularProgress />
										) : (
											'MINT'
										)
									) : (
										<Countdown
											date={startDate}
											onMount={({ completed }) =>
												completed && setIsActive(true)
											}
											onComplete={() => setIsActive(true)}
											renderer={renderCounter}
										/>
									)}
								</MintButton>
							</>
						)}
					</MintContainer>
					<br />
					{disableMint && (
						<p style={{ color: 'red' }}>
							Mint at 330PM UTC (WL)/4PM UTC (public)
						</p>
					)}
				</div>
				<Snackbar
					open={alertState.open}
					autoHideDuration={6000}
					onClose={() =>
						setAlertState({ ...alertState, open: false })
					}
				>
					<Alert
						onClose={() =>
							setAlertState({ ...alertState, open: false })
						}
						severity={alertState.severity}
					>
						{alertState.message}
					</Alert>
				</Snackbar>
			</StartContainer>
		</main>
	);
};

interface AlertState {
	open: boolean;
	message: string;
	severity: 'success' | 'info' | 'warning' | 'error' | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
	return (
		<CounterText>
			{hours + (days || 0) * 24} hours, {minutes} minutes, {seconds}{' '}
			seconds
		</CounterText>
	);
};

export default Home;
