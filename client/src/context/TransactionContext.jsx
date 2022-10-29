import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';
import { parse } from '@ethersproject/transactions';

export const TransactionContext = React.createContext();

const ethereum = window.ethereum; // equivalent to const {ethereum} = window;

const getEthereumContract = () => {
    // weird: he creates this provider, 
    // but down below he uses metamask api instead of the created wrapped metamask api by ethers
    const provider = new ethers.providers.Web3Provider(ethereum); 

    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    return transactionContract;
}

export const TransactionProvider = ({children}) => {
    const [connectedAccount, setConnectedAccount] = useState('');
    const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '', message: ''});
    const [isLoading, setLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    }

    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert('Please install metamask');
            
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();

            const structeredTransactions = availableTransactions.map((transaction)=>{
                console.log(transaction);
                return (
                {
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timeStamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10**18)
            })});
            setTransactions(structeredTransactions);

            console.log(availableTransactions);
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            // ethereum object exists in window when metamask is installed, 
            // metamask injects an ethereum object (their api) into the window object
            if (!ethereum) return alert('Please install metamask');
            
            // via .requests() we are accessing the Ethereum RPC via the basic metamask api
            const accounts = await ethereum.request({method: 'eth_accounts'});
            console.log(accounts);
    
            if (accounts.length){
                setConnectedAccount(accounts[0]);
                getAllTransactions();
            } else{
                console.log("No accounts found");
            }
            
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount)
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const connectWallet = async () => {
        try {

            if (!ethereum) return alert('Please install metamask');

            const accounts = await ethereum.request({method: 'eth_requestAccounts'});

            setConnectedAccount(accounts[0]);

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert('Please install metamask');
            
            const {addressTo, amount, keyword, message} = formData;
            
            const transactionContract = getEthereumContract();
            
            const parsedAmount = ethers.utils.parseEther(amount); //decimals to hexadecimal string

            // '0x5208' = 21k wei or 0.000021

            // needs confirmation via metamask
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: connectedAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex
                }]
            })
            
            // needs confirmation via metamask
            const transactionHash = await transactionContract.addToBlockChain(addressTo, parsedAmount, message, keyword);

            setLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());
            
            window.reload();
            //signer.sendTransaction() use of ethers api (probably not precisly this line of code)
            
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }


    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider value={{connectWallet, connectedAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading, transactionCount}}>
            {children}
        </TransactionContext.Provider>
    )
}