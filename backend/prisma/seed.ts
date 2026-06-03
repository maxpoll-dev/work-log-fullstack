import * as argon2 from 'argon2';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

const url = new URL(process.env.DATABASE_URL ?? '');
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
});

const prisma = new PrismaClient({ adapter });

const UNITS = ['м²', 'м³', 'м.п.', 'т', 'шт', 'ч'] as const;
type Unit = (typeof UNITS)[number];

const WORK_TYPES: { name: string; unit: Unit }[] = [
  { name: 'Кладка кирпича', unit: 'м³' },
  { name: 'Кладка перегородок', unit: 'м²' },
  { name: 'Монтаж опалубки', unit: 'м²' },
  { name: 'Бетонирование', unit: 'м³' },
  { name: 'Армирование', unit: 'т' },
  { name: 'Штукатурка стен', unit: 'м²' },
  { name: 'Стяжка пола', unit: 'м²' },
  { name: 'Укладка плитки', unit: 'м²' },
  { name: 'Малярные работы', unit: 'м²' },
  { name: 'Монтаж гипсокартона', unit: 'м²' },
  { name: 'Устройство кровли', unit: 'м²' },
  { name: 'Утепление фасада', unit: 'м²' },
  { name: 'Земляные работы', unit: 'м³' },
  { name: 'Демонтаж конструкций', unit: 'м³' },
  { name: 'Прокладка кабеля', unit: 'м.п.' },
  { name: 'Монтаж трубопровода', unit: 'м.п.' },
  { name: 'Установка дверей', unit: 'шт' },
  { name: 'Установка окон', unit: 'шт' },
  { name: 'Монтажные работы (бригада)', unit: 'ч' },
];

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randQuantity = (unit: Unit): string => {
  switch (unit) {
    case 'шт':
      return String(randInt(1, 20));
    case 'т':
      return (randInt(5, 80) / 10).toFixed(1);
    case 'ч':
      return String(randInt(1, 12));
    default:
      return (randInt(50, 4000) / 10).toFixed(1);
  }
};

const randDate = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, 90));
  d.setHours(randInt(6, 20), randInt(0, 59), 0, 0);
  return d;
};

async function main() {
  await prisma.workLogEntry.deleteMany();
  await prisma.workType.deleteMany();
  await prisma.workUnit.deleteMany();
  await prisma.user.deleteMany();

  const units = await Promise.all(
    UNITS.map((name) => prisma.workUnit.create({ data: { name } })),
  );
  const unitId = new Map(units.map((u) => [u.name as Unit, u.id]));

  const types = await Promise.all(
    WORK_TYPES.map((t) =>
      prisma.workType.create({ data: { name: t.name } }).then((row) => ({
        ...row,
        unit: t.unit,
        unitId: unitId.get(t.unit)!,
      })),
    ),
  );

  const passwordHash = await argon2.hash('password');

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        passwordHash,
        role: 'CLIENT',
        firstName: 'Пётр',
        lastName: 'Каменщиков',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        passwordHash,
        role: 'CLIENT',
        firstName: 'Сергей',
        lastName: 'Бетонов',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user3@example.com',
        passwordHash,
        role: 'CLIENT',
        firstName: 'Иван',
        lastName: 'Гипсокартонов',
      },
    }),
  ]);

  const TOTAL = 500;
  const entries = Array.from({ length: TOTAL }, () => {
    const user = pick(users);
    const type = pick(types);
    const qty = randQuantity(type.unit);
    return {
      userId: user.id,
      typeId: type.id,
      unitId: type.unitId,
      amount: qty,
      createdAt: randDate(),
    };
  });

  await prisma.workLogEntry.createMany({ data: entries });

  console.log(
    `Seed завершён: ${users.length} пользователя, ${types.length} типов работ, ${units.length} ед. изм., ${TOTAL} записей`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
