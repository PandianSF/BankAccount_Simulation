"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const id_1 = require("@jetit/id");
let accounts = [];
const kycAccounts = [];
let ledger = [];
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 3000;
//To Create a account for account Holder
app.post("/Create", (req, res) => {
    const additionData = { account_Id: (0, id_1.generateID)("HEX"), kycStatus: "pending" };
    const newAccount = Object.assign(Object.assign({}, req.body), additionData);
    accounts.push(newAccount);
    res.send({
        status: "SUCCESS",
        data: newAccount,
        message: "Bank Account Created Successfully",
    });
});
//To get list of Account Holders
app.get("/accountsList", (req, res) => {
    res.send(accounts);
});
//To Check Kyc status
app.get("/Kyc", (req, res) => {
    let kycSession = accounts.find((v) => v.account_Id === req.body.account_Id);
    if (!kycSession) {
        throw new Error("Account not found/Invalid account!");
    }
    else {
        if (kycSession.name !== req.body.name) {
            throw new Error("Account name is Incorrect!");
        }
        if (kycSession.dob !== req.body.dob) {
            throw new Error("DOB of account holder is not matched with this account!");
        }
        if (kycSession.email !== req.body.email) {
            throw new Error("Sorry,Email is not matched!");
        }
        if (kycSession.aadharNumber !== req.body.aadharNumber) {
            throw new Error("Oops,Aadhar Number is not matched with this account!");
        }
        if (kycSession.panNumber !== req.body.panNumber) {
            throw new Error("Oops,Pan Number is not matched with this account!");
        }
        if (kycSession.phoneNumber !== req.body.phoneNumber) {
            throw new Error("Phone Number is Invalid!");
        }
        kycSession.kycStatus = "SUCCESS";
        res.send({
            status: "SUCCESS",
            message: "Kyc Status updated Successfully!",
        });
    }
});
//To Deposit Money
app.put("/depositMoney", (req, res) => {
    const findAccount = accounts.find((v) => v.account_Id === req.body.account_Id);
    if (!findAccount) {
        throw new Error("Account not found/Account Invalid!");
    }
    else if (findAccount.kycStatus === "pending") {
        throw new Error("Kyc check not done!");
    }
    else {
        const deposit = req.body.depositAmount;
        findAccount.balance = deposit + findAccount.balance;
        //To update and create ledger
        const transactionId = (0, id_1.generateID)("HEX");
        const accountId = findAccount.account_Id;
        const depositAmount = req.body.depositAmount;
        const transactionType = req.body.transactionType;
        const transactions = {
            accountId,
            transactionId,
            depositAmount,
            transactionType,
        };
        ledger.push(transactions);
        res.send({
            status: "SUCCESS",
            message: "Amount deposited to this account Successfully",
        });
    }
});
//To WithDraw Money
app.delete("/withdrawMoney", (req, res) => {
    const findAccount = accounts.find((v) => v.account_Id === req.body.account_Id);
    if (!findAccount || findAccount.kycStatus === "pending") {
        throw new Error("Account Invalid/Kyc Check not done!");
    }
    if (findAccount.balance < req.body.withdrawAmount) {
        res.send({
            status: "ERROR",
            message: "Insufficient balance in the account!",
        });
        return;
    }
    const withdraw = req.body.withdrawAmount;
    findAccount.balance = findAccount.balance - withdraw;
    //To update ledger
    const transactionId = (0, id_1.generateID)("HEX");
    const accountId = findAccount.account_Id;
    const withdrawAmount = req.body.withdrawAmount;
    const transactionType = req.body.transactionType;
    const transactions = {
        accountId,
        transactionId,
        withdrawAmount,
        transactionType,
    };
    ledger.push(transactions);
    console.log(ledger);
    res.send({
        status: "SUCCESS",
        message: "Money withdrawn from this acccount!",
    });
});
//To Transfer Money
app.post("/transferMoney", (req, res) => {
    const receiverAcc = accounts.find((v) => v.account_Id === req.body.receiverAccountId);
    const donorAcc = accounts.find((v) => v.account_Id === req.body.donorAccountId);
    if (!receiverAcc || receiverAcc.kycStatus === "pending") {
        throw new Error("Requester Account Invalid/Kyc check not done!");
    }
    if (!donorAcc || donorAcc.kycStatus === "pending") {
        throw new Error("merchant Account Invalid/Kyc check not done!");
    }
    if (donorAcc.balance < req.body.sentAmount) {
        throw new Error("Insufficient balance in the account!");
    }
    const debitAmount = donorAcc.balance - req.body.sentAmount; // debit amt
    donorAcc.balance = debitAmount;
    const creditAmount = receiverAcc.balance + req.body.sentAmount;
    receiverAcc.balance = creditAmount;
    //To update ledger
    const transactionId = (0, id_1.generateID)("HEX");
    const accountId = donorAcc.account_Id;
    console.log("----->", donorAcc);
    const transactionType = req.body.transactionType;
    const sentAmount = req.body.sentAmount;
    const transactions = {
        accountId,
        transactionId,
        sentAmount,
        transactionType,
    };
    console.log(transactions);
    ledger.push(transactions);
    res.send({
        status: "SUCCESS",
        message: "Amount transferred Successfully!",
    });
    return;
});
//To Receive Money
app.post("/receiveMoney", (req, res) => {
    const donorAcc = accounts.find((v) => v.account_Id === req.body.donorAccountId);
    const merchantAcc = accounts.find((v) => v.account_Id === req.body.merchantAccountId);
    const creditAmount = merchantAcc.balance + req.body.receivedAmount;
    merchantAcc.balance = creditAmount;
    //To update ledger
    const transactionId = (0, id_1.generateID)("HEX");
    const accountId = merchantAcc.account_Id;
    const transactionType = req.body.transactionType;
    const receivedAmount = req.body.receivedAmount;
    const transactions = {
        accountId,
        transactionId,
        transactionType,
        receivedAmount,
    };
    ledger.push(transactions);
    res.send({
        status: "SUCCESS",
        message: "Amount received Successfully!",
    });
});
//To print ledger
app.get("/printStatement", (req, res) => {
    const foundAcc = accounts.find((v) => v.account_Id === req.body.account_Id);
    console.log(foundAcc);
    if (!foundAcc || foundAcc.kycStatus === "pending") {
        res.send({
            status: "ERROR",
            message: "Account not found/Kyc check not done!!",
        });
    }
    else {
        res.send({
            status: "SUCCESS",
            data: ledger,
            message: "Account statement printed Successfully!",
        });
    }
});
//To  close account
app.get("/closeAccount", (req, res) => {
    const deactAcc = accounts.find((v) => v.account_Id === req.body.closeAccountId);
    console.log(deactAcc);
    if (deactAcc) {
        deactAcc.accountStatus = req.body.accountStatus;
        res.send({
            status: "SUCCESS",
            message: "Account deactivated!",
        });
    }
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
