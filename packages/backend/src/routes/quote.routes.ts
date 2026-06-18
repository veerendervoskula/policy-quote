import express from 'express';
import { handler } from '../lambda';

const app = express();

app.use(express.json());

app.post(
  '/policy/quote',
  async (req, res) => {

    const result =
      await handler(
        {
          body: JSON.stringify(req.body)
        } as any,
        {} as any
      );

    res
      .status(result.statusCode)
      .json(
        JSON.parse(result.body)
      );
  }
);

app.listen(3000, () => {
  console.log(
    'API listening on port 3000'
  );
});