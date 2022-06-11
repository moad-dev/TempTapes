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
            "parent_id": parent_id,
        })
    return roads[1:]


def gen_tags(amount):
    tags = []
    for i in range(amount):
        tags.append({
            "tag_id": i,
            "name": randstr(8, 16)
        })
    return tags


def gen_events(amount, roads, tags, start, end):
    events = []
    for i in range(amount):
        events.append({
            "event_id": i,
            "date": randdate(start, end),
            "name": randstr(8, 16),
            "color": randcolor(),
            "icon": randicon(),
            "path_id": random.choice(roads)["path_id"],
            "tags": [
                random.choice(tags)["tag_id"]
                for _ in range(random.randint(0, 16))
            ]
        })
    return events


def seed(roads_amount, events_amount, date_start, date_end, nested, filename):
    conn = sqlite3.connect(filename)
    sql = conn.cursor()

    sql.execute("pragma foreign_keys=on")
    sql.execute("delete from paths")
    sql.execute("delete from bind_event_tag")
    sql.execute("delete from tags")
    sql.execute("delete from events")
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
        insert into tags values (
            :tag_id, :name
        )
        """,
        tags := gen_tags(32)
    )
    conn.commit()

    sql.executemany(
        """
        insert into events (event_id, date, name, color, icon, path_id)
        values (
            :event_id, :date, :name, :color, :icon, :path_id
        )
        """,
        events := gen_events(events_amount, roads, tags, date_start, date_end)
    )

    conn.commit()

    sql.executemany(
        """
        insert into bind_event_tag (event_id, tag_id)
        values (:event_id, :tag_id)
        """,
        [
            {"event_id": event["event_id"], "tag_id": tag_id}
            for event in events for tag_id in event["tags"]
        ]
    )

    conn.commit()
    conn.close()

    end = time.time()
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

    parser.add_argument(
        "--filename",
        help="Файл БД",
        type=str,
        required=True
    )

    args = parser.parse_args()
    random.seed(args.seed)

    tm = seed(args.roads, args.events, *args.date, args.nested, args.filename)

    print(
        f"Generated {HI}{args.events}{END} events"
        f"on {HI}{args.roads}{END} roads",
        f"with {HI}{args.seed}{END} seed in {HI}{tm:.3f}s.{END}"
    )
