import datetime
import random
import os

# from heavy import special_commit


def modify():
    file = open('zero.md', 'r')
    file.close()
    file = open('zero.md', 'w+')
    file.write(str(random.randint(0,90000000000)))
    file.close()
    commit()


def commit():
    os.system('git add .')
    os.system('git commit -m update')


def set_sys_time(year, month, day):
    os.system('date -s %04d%02d%02d' % (year, month, day))


def trick_commit(year, month, day):
    set_sys_time(year, month, day)
    for i in range(random.randint(0,3)):
        modify()
        


def daily_commit(start_date, end_date):
    for i in range((end_date - start_date).days + 1):
        cur_date = start_date + datetime.timedelta(days=i)
        trick_commit(cur_date.year, cur_date.month, cur_date.day)


if __name__ == '__main__':
    daily_commit(datetime.date(2018, 4, 15), datetime.date(2018, 8, 25))



