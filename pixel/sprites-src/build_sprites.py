"""Vẽ nhân vật pixel cho bản pixel của Game Work Hub.

Chạy:  python build_sprites.py        (tạo PNG vào ..\assets\)
Chỉ dùng thư viện chuẩn của Python. Mỗi ký tự trong lưới = 1 ô pixel.
Nhân vật Linh dùng lại lưới gốc trong portfolio của bạn (32 x 41 ô).
"""
import os, struct, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets')
SCALE = 8

PAL = {
    'K': '#1A1C2C', 'b': '#252B45', 'B': '#3D5E9E', 'S': '#F5CFB0', 's': '#E0AA8A',
    'E': '#1A1C2C', 'P': '#F29A9A', 'M': '#C9606A', 'L': '#F6F3EC', 'l': '#CFC9BC',
    'o': '#9C9384', 'D': '#1E1E24', 'd': '#3A3A44', 'C': '#4A4E5E', 'R': '#E0465A',
    'r': '#A82E40', 'w': '#FFFFFF', 'W': '#FFFFFF', 'Y': '#F2B84B', 'y': '#D39A2E',
    'U': '#8E7CC3', 'u': '#6B5AA6', 'N': '#8DB6E8', 'n': '#5E8FC9', 'J': '#23242E',
    'j': '#44465A', 'Z': '#C4C8D4', 'Q': '#F5A8C8', 'q': '#DD6FA0', 'T': '#33C2B0',
    't': '#1E8F82', 'G': '#7BC47F', 'F': '#F9D6B2',
}

BASE = """
................................
...........KKKKKKKKKK...........
.........KKKbbbbbbbbKKK.........
........KKbbbbbbbbbbbbKK........
.......KbbbBBbbbbbbbbbbbK.......
......KbbBBbbbbbbbbbbbbbbK......
......KbBbbbbbbbbbbbbbbbbK......
.....KbbbbbbbbbbbbbbbbbbbbK.....
.....KbbbbbbbbbSSbbbbbbbbbK.....
.....KbbbbbbbSSSSSSbbbbbbbK.....
.....KbbbbbSSSSSSSSSSbbbbbK.....
.....KbbbbSSSSSSSSSSSSbbbbK.....
.....KbbbSSEESSSSSSEESSbbbK.....
.....KbbbSSEBSSSSSSEBSSbbbK.....
.....KbbbSPPSSSSSSSSPPSbbbK.....
.....KbbbSSSSSSMMSSSSSSbbbK.....
.....KbbbbsSSSSSSSSSSsbbbbK.....
.....KbbbbbssssssssssbbbbbK.....
....KbbbbbbbbbssssbbbbbbbbbK....
....KbbbbbLLLLlSSlLLLLbbbbbK....
....KbbBbbLLLLLloLLLLLbbBbbK....
....KbbbblLLLLLllLLLLLlbbbbK....
....KbbbblLLLLLloLLLLLlbbbbK....
....KbBbblLLLLLllLLLLLlbbBbK....
....KbbbblLLLLLloLLLLLlbbbbK....
.....KbbblLLLLLllLLLLLlbbbK.....
.....KbbblLLLLLloLLLLLlbbbK.....
......KbblLLLLLllLLLLLlbbK......
......KbKSlLLLLllLLLLlSKbK......
.........SllllllllllllS.........
..........DDDDDDDDDDDD..........
..........DDDDDddDDDDD..........
..........DDDDD..DDDDD..........
...........SSSs..sSSS...........
...........SSSs..sSSS...........
...........SSSs..sSSS...........
...........SSSs..sSSS...........
...........SSSs..sSSS...........
...........sSSs..sSSs...........
..........KKKKK..KKKKK..........
..........KKKKK..KKKKK..........
""".strip().split('\n')

assert all(len(r) == 32 for r in BASE), [len(r) for r in BASE]
assert len(BASE) == 41


# ---------- công cụ vẽ ----------
def clone(rows):
    return [list(r) for r in rows]


def put(g, r, cols, ch):
    for c in cols:
        g[r][c] = ch


def fill(g, r, c0, c1, ch):
    for c in range(c0, c1 + 1):
        g[r][c] = ch


def recolor(g, r0, r1, m):
    for r in range(r0, r1 + 1):
        for c in range(len(g[r])):
            if g[r][c] in m:
                g[r][c] = m[g[r][c]]


def hexrgb(h):
    h = h.lstrip('#')
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def write_png(path, grid, scale=SCALE):
    h, w = len(grid), len(grid[0])
    raw = bytearray()
    for y in range(h):
        line = bytearray()
        for x in range(w):
            ch = grid[y][x]
            if ch in PAL:
                r, g, b = hexrgb(PAL[ch])
                px = bytes((r, g, b, 255))
            else:
                px = bytes((0, 0, 0, 0))
            line += px * scale
        for _ in range(scale):
            raw += b'\x00' + line

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', w * scale, h * scale, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)


# ---------- 4 bộ trang phục của Linh ----------
def punk():
    """Áo khoác da đen + áo đỏ + váy caro đỏ đen + choker + bốt đinh tán."""
    g = clone(BASE)
    recolor(g, 19, 28, {'L': 'J', 'l': 'j', 'o': 'j'})
    for r in range(20, 28):
        fill(g, r, 14, 17, 'R')
    for r in range(20, 27):
        put(g, r, [13, 18], 'j')
    put(g, 19, [10, 21], 'Z')
    put(g, 21, [12, 19], 'Z')
    put(g, 24, [12, 19], 'Z')
    fill(g, 18, 14, 17, 'J')
    g[18][15] = 'Z'
    for c in range(10, 22):
        g[30][c] = 'R' if c % 2 == 0 else 'J'
    for c in range(9, 23):
        g[31][c] = 'J' if c % 2 == 0 else 'R'
    for c in range(9, 23):
        g[32][c] = 'J'
    put(g, 32, [10, 13, 16, 19], 'Z')
    recolor(g, 36, 38, {'S': 'J', 's': 'j'})
    fill(g, 38, 10, 14, 'J')
    fill(g, 38, 17, 21, 'J')
    fill(g, 39, 10, 14, 'J')
    fill(g, 39, 17, 21, 'J')
    put(g, 37, [11, 20], 'Z')
    put(g, 38, [10, 21], 'Z')
    return g


def kawaii():
    """Váy hồng búp bê: cổ trắng, nơ đỏ, váy xòe viền ren, tất trắng, giày đỏ."""
    g = clone(BASE)
    recolor(g, 19, 28, {'L': 'Q', 'l': 'q', 'o': 'q'})
    put(g, 19, [12, 13, 18, 19], 'W')
    put(g, 20, [12, 19], 'W')
    for c, ch in zip(range(13, 19), 'RRrrRR'):
        g[19][c] = ch
    for c, ch in zip(range(14, 18), 'RrrR'):
        g[20][c] = ch
    fill(g, 28, 10, 21, 'q')
    fill(g, 29, 10, 21, 'W')
    fill(g, 30, 9, 22, 'Q')
    fill(g, 31, 8, 23, 'Q')
    fill(g, 32, 8, 23, 'Q')
    for r in (30, 31, 32):
        for c in (11, 14, 17, 20):
            g[r][c] = 'q'
    for c in range(8, 24):
        g[32][c] = 'W' if c % 2 == 0 else 'Q'
    recolor(g, 35, 38, {'S': 'W', 's': 'l'})
    fill(g, 39, 10, 14, 'R')
    fill(g, 39, 17, 21, 'R')
    put(g, 39, [12, 19], 'Y')
    put(g, 4, [19, 20], 'Q')
    put(g, 5, [19, 20], 'q')
    return g


def denim():
    """Áo khoác denim + áo thun trắng + chân váy xếp ly vàng + sneaker trắng."""
    g = clone(BASE)
    recolor(g, 19, 28, {'L': 'N', 'l': 'n', 'o': 'n'})
    for r in range(20, 28):
        fill(g, r, 14, 17, 'W')
    put(g, 23, [15, 16], 'R')
    put(g, 24, [15, 16], 'R')
    put(g, 19, [12, 13, 18, 19], 'n')
    put(g, 24, [11, 12, 19, 20], 'n')
    put(g, 22, [13, 18], 'Y')
    for r, c0, c1 in ((30, 10, 21), (31, 9, 22), (32, 9, 22)):
        for c in range(c0, c1 + 1):
            g[r][c] = 'Y' if c % 2 == 0 else 'y'
    recolor(g, 37, 38, {'S': 'W', 's': 'l'})
    fill(g, 39, 10, 14, 'W')
    fill(g, 39, 17, 21, 'W')
    put(g, 39, [13, 18], 'R')
    return g


def hoodie():
    """Hoodie dài như váy màu xanh ngọc + legging đen + sneaker neon."""
    g = clone(BASE)
    recolor(g, 19, 28, {'L': 'T', 'l': 't', 'o': 't'})
    for r in (20, 21, 22):
        put(g, r, [14, 17], 'W')
    put(g, 24, [15, 16], 'Y')
    fill(g, 25, 14, 17, 'Y')
    put(g, 26, [15, 16], 'Y')
    fill(g, 27, 12, 19, 't')
    fill(g, 29, 10, 21, 'T')
    fill(g, 30, 10, 21, 'T')
    fill(g, 31, 9, 22, 'T')
    fill(g, 32, 9, 22, 't')
    recolor(g, 33, 38, {'S': 'J', 's': 'j'})
    fill(g, 38, 10, 14, 'W')
    fill(g, 38, 17, 21, 'W')
    fill(g, 39, 9, 14, 'W')
    fill(g, 39, 17, 22, 'W')
    fill(g, 40, 9, 14, 'K')
    fill(g, 40, 17, 22, 'K')
    put(g, 39, [11, 12, 19, 20], 'Q')
    return g


# ---------- Linh theo tâm trạng (dùng bộ hoodie, đổi nét mặt + chi tiết xung quanh) ----------
def star(g, r, c, ch):
    put(g, r, [c - 1, c, c + 1], ch)
    put(g, r - 1, [c], ch)
    put(g, r + 1, [c], ch)


def clear_eyes(g):
    for r in (12, 13):
        put(g, r, [11, 12, 19, 20], 'S')


def mood(name):
    g = hoodie()
    if name == 'happy':        # vui: mắt cười ^ ^, miệng cười toe, lấp lánh
        clear_eyes(g)
        put(g, 12, [11, 12, 19, 20], 'E')
        put(g, 13, [10, 13, 18, 21], 'E')
        put(g, 15, [15, 16], 'S')
        put(g, 15, [14, 15, 16, 17], 'M')
        put(g, 16, [15, 16], 'M')
        star(g, 5, 2, 'Y')
        star(g, 9, 29, 'Y')
    elif name == 'chill':      # bình yên: cười nhẹ + nốt nhạc
        put(g, 15, [15, 16], 'S')
        put(g, 15, [14, 17], 'M')
        put(g, 16, [15, 16], 'M')
        put(g, 5, [29], 'Q')
        put(g, 6, [29], 'Q')
        put(g, 7, [29], 'Q')
        put(g, 8, [28, 29], 'Q')
        put(g, 5, [30], 'Q')
    elif name == 'busy':       # ngập việc: mắt tròn, mồ hôi, giấy tờ bay
        put(g, 12, [11, 12, 19, 20], 'E')
        put(g, 13, [11, 12, 19, 20], 'E')
        put(g, 12, [11, 19], 'w')
        put(g, 15, [15, 16], 'S')
        put(g, 15, [14, 16], 'M')
        put(g, 16, [15, 17], 'M')
        put(g, 9, [18], 'N')
        put(g, 10, [18], 'N')
        put(g, 11, [18], 'n')
        for r in range(14, 18):
            fill(g, r, 0, 3, 'W')
        put(g, 15, [1, 2], 'Z')
        put(g, 17, [1, 2], 'Z')
        for r in range(12, 16):
            fill(g, r, 28, 31, 'W')
        put(g, 13, [29, 30], 'Z')
        put(g, 15, [29, 30], 'Z')
    elif name == 'tired':      # mệt: mắt nhắm, quầng thâm, ngủ gật Z
        clear_eyes(g)
        put(g, 13, [11, 12, 19, 20], 'E')
        put(g, 14, [12, 19], 'u')
        put(g, 1, [27, 28, 29], 'N')
        put(g, 2, [28], 'N')
        put(g, 3, [27, 28, 29], 'N')
        put(g, 5, [30, 31], 'N')
        put(g, 6, [30], 'N')
        put(g, 7, [30, 31], 'N')
    elif name == 'stress':     # căng thẳng: chân mày chéo, miệng mếu, gân đỏ
        put(g, 11, [12, 13], 'E')
        put(g, 10, [11], 'E')
        put(g, 11, [18, 19], 'E')
        put(g, 10, [20], 'E')
        put(g, 16, [14, 17], 'M')
        put(g, 5, [28], 'R')
        put(g, 6, [27, 28, 29], 'R')
        put(g, 7, [28], 'R')
    elif name == 'sad':        # buồn: nước mắt, miệng mếu, mây mưa
        for r in (14, 15, 16):
            put(g, r, [11, 20], 'N')
        put(g, 16, [14, 17], 'M')
        put(g, 1, [1, 2, 3], 'Z')
        put(g, 2, [0, 1, 2, 3, 4], 'Z')
        put(g, 3, [1, 2, 3], 'Z')
        put(g, 4, [1], 'N')
        put(g, 5, [3], 'N')
        put(g, 6, [2], 'N')
    return g


MOODS = ['happy', 'chill', 'busy', 'tired', 'stress', 'sad']


def main():
    os.makedirs(OUT, exist_ok=True)
    for m in MOODS:
        write_png(os.path.join(OUT, 'linh-mood-%s.png' % m), mood(m))
    for name, fn in (('linh-punk', punk), ('linh-kawaii', kawaii), ('linh-denim', denim), ('linh-hoodie', hoodie)):
        write_png(os.path.join(OUT, name + '.png'), fn())
    print('xong:', sorted(f for f in os.listdir(OUT) if f.startswith(('linh-punk', 'linh-kawaii', 'linh-denim', 'linh-hoodie'))))


if __name__ == '__main__':
    main()
