#!/usr/bin/env python3

import argparse
import datetime
import random
import string
import os
import sqlite3
import time

PATH = os.path.dirname(os.path.abspath(__file__))
ICONS = os.listdir(f"{PATH}/../storage/img")
HI = '\033[0;33m'
END = '\033[0m'


def randcolor():
    red = random.randint(0, 255)
    green = random.randint(0, 255)
    blue = random.randint(0, 255)
    return f"#{red:02X}{green:02X}{blue:02X}"


def randstr(start, end=None):
    start = end - 1 if not end else start
    alpha = string.ascii_letters + string.digits
    return "".join(
        random.choice(alpha)
        for i in range(random.randint(start, end - 1))
    )


def randicon():
    return random.choice(ICONS)


def randdate(start, end):
    delta = end - start

    result = start + datetime.timedelta(
        days=int(delta.days * random.random())
    )

    return result.strftime("%Y-%m-%d")


def gen_roads(amount, nested):
    roads = [{"path_id": None}]
    for i in range(amount):
        parent_id = random.choice(roads)["path_id"] if nested else None
        roads.append({
            "path_id": i,
            "name": randstr(8, 16),
            "color": randcolor(),
            "icon": randicon(),
            "parent_id": parent_id
        })
    return roads[1:]


def gen_events(amount, roads, start, end):
    for _ in range(amount):
        yield {
            "date": randdate(start, end),
            "name": randstr(8, 16),
            "color": randcolor(),
            "icon": randicon(),
            "path_id": random.choice(roads)["path_id"]
        }


def seed(roads_amount, events_amount, date_start, date_end, nested):
    conn = sqlite3.connect("database.db")
    sql = conn.cursor()

    sql.execute("pragma foreign_keys=on")
    sql.execute("delete from paths")
    conn.commit()

    start = time.time()
    sql.executemany(
        """
        insert into paths values (
            :path_id, :name, :color, :icon, :parent_id
        )
        """,
        roads := gen_roads(roads_amount, nested)
    )
    conn.commit()

    sql.executemany(
        """
        insert into events (date, name, color, icon, path_id)
        values (
            :date, :name, :color, :icon, :path_id
        )
        """,
        gen_events(events_amount, roads, date_start, date_end)
    )
    end = time.time()

    conn.commit()
    conn.close()

    return end - start


def valid_date(to_parse):
    try:
        return datetime.datetime.strptime(to_parse, "%Y-%m-%d")
    except ValueError as ex:
        msg = f"Not a valid date: {to_parse}"
        raise argparse.ArgumentTypeError(msg) from ex


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--roads",
        help="Количество дорог",
        type=int,
        required=True
    )

    parser.add_argument(
        "--events",
        help="Количество событий",
        type=int,
        required=True
    )

    parser.add_argument(
        "--date",
        help="Диапазон генерируемых событий",
        type=valid_date,
        nargs=2,
        metavar=("date_start", "date_end"),
        required=True
    )

    parser.add_argument(
        "--seed",
        help="Seed для random, time.time(), если не определен",
        type=int,
        default=int(time.time())
    )

    parser.add_argument(
        "--nested",
        help="Вложенные дороги (по умолчанию - false)",
        default=False,
        action='store_true'
    )

    args = parser.parse_args()
    random.seed(args.seed)

    tm = seed(args.roads, args.events, *args.date, args.nested)

    print(
        f"Generated {HI}{args.events}{END} events"
        f"on {HI}{args.roads}{END} roads",
        f"with {HI}{args.seed}{END} seed in {HI}{tm:.3f}s.{END}"
    )
