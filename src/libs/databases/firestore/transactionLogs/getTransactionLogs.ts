import { getCollectionRef } from "../commons";
import { TransactionLog } from "src/interfaces/models/transaction";
import { DEFAULT_IN_QUERY_VALUE } from "src/constants/firestore/query/value";
import { StatusCode } from "src/constants/statusCode";
import { CollectionPath } from "src/constants/firestore";
import { chunkArray } from "src/utils/api/queries";
import { CustomError } from "src/libs/errors/apiError";

export async function getTransactionLogs(transactionLogs: string[]): Promise<TransactionLog[]>;

export async function getTransactionLogs<T>(
    transactionLogIds: string[],
    callback: (TransactionLog: TransactionLog) => T
): Promise<T[]>;

export async function getTransactionLogs<T>(
    transactionLogIds: string[],
    callback?: (TransactionLog: TransactionLog) => T
): Promise<T[]> {
    try {
        const retrievedTransactionLogs: T[] = [];
        if (transactionLogIds.length > 0) {
            const transactionLogCollection = getCollectionRef(CollectionPath.TRANSACTION);
            const chunks = chunkArray<string>(transactionLogIds, DEFAULT_IN_QUERY_VALUE);
            for (const chunk of chunks) {
                const querySnapshot = await transactionLogCollection
                    .where("transactionId", "in", chunk)
                    .get();
                const retrievedTransactionLogChunk = querySnapshot.docs.map(
                    (transactionLogSnapshot) => {
                        const transactionLog = transactionLogSnapshot.data() as TransactionLog;
                        if (callback) {
                            return callback(transactionLog);
                        }
                        return transactionLog as T;
                    }
                );
                retrievedTransactionLogs.push(...retrievedTransactionLogChunk);
            }
        }
        return retrievedTransactionLogs;
    } catch (error: unknown) {
        console.log(error);
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError("Retrive transaction logs failed", StatusCode.INTERNAL_SERVER_ERROR);
    }
}