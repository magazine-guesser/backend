import { IMagazineRepository, Magazine } from './types';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { BatchWriteCommand, DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME as string;

export class DynamoMagazineRepository implements IMagazineRepository {

    async getMagazines(date: string): Promise<Magazine[]> {
        const result = await docClient.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: '#date = :date',
            ExpressionAttributeNames: { '#date': 'date' },
            ExpressionAttributeValues: { ':date': date }
        }));
        return result.Items as Magazine[];
    }

    async getMagazine(date: string, nr: number): Promise<Magazine> {
        const result = await docClient.send(new GetCommand({
            TableName: tableName,
            Key: {
                'date': date,
                'nr': Number(nr)
            }
        }));
        return result.Item as Magazine;
    }

    async putMagazines(magazines: Magazine[]): Promise<void> {
        await docClient.send(new BatchWriteCommand({
            RequestItems: {
                [tableName]: magazines.map(mag => ({
                    PutRequest: { Item: mag }
                }))
            }
        }));
    }
}