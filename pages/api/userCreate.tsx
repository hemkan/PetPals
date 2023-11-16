import prisma from '@/lib/prismadb';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      let userEmail, password, phoneNumber: any;

      if (typeof req.body === 'object') {
        userEmail = req.body.userEmail;
        password = req.body.password;
        phoneNumber = req.body.phoneNumber;
      } else {
        const body = JSON.parse(req.body);
        userEmail = body.userEmail;
        password = body.password;
        phoneNumber = body.phoneNumber;
      }

      const findIfExist = await prisma.user.findFirst({
        where: { email: userEmail },
      });

      if (findIfExist !== null && findIfExist !== undefined) {
        res.status(401).json('Username Is Taken!');
        return;
      }

      const user = await prisma.user.create({
        data: {
          email: userEmail,
          password: password,
          phoneNumber: phoneNumber,
          name: '',
          description: '',
        },
      });
      res.status(200).json('Success');
    } catch (error) {
      console.log(error);
      res.status(500).json('Unknown Error Occurred');
    }
  } else {
    res.status(405).json(null);
  }
}
