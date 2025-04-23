import { NextRequest, NextResponse } from 'next/server';
import { withORMContext } from '@/db/orm';
import { RequestHistory } from '@/db/entities/RequestHistory';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const offset = (page - 1) * pageSize;

  return withORMContext(async (orm) => {
    const repo = orm.em.getRepository(RequestHistory);
    const [items, total] = await repo.findAndCount({}, {
      orderBy: { createdAt: 'desc' },
      limit: pageSize,
      offset,
    });
    return NextResponse.json({ items, total, page, pageSize });
  });
}
