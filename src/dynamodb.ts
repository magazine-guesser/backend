import { IMagazineRepository, Magazine } from './types';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class DynamoMagazineRepository implements IMagazineRepository {

    async getMagazines(date: string): Promise<Magazine[]> {
        const result = await docClient.send(new QueryCommand({
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: '#date = :date',
            ExpressionAttributeNames: { '#date': 'date' },
            ExpressionAttributeValues: { ':date': date }
        }));
        return result.Items as Magazine[];
    }

    async getMagazine(date: string, nr: number): Promise<Magazine> {
        const result = await docClient.send(new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'date': date,
                'nr': Number(nr)
            }
        }));
        return result.Item as Magazine;
    }
}