const leftRotate = (value: number, shift: number) =>
  (value << shift) | (value >>> (32 - shift));

const toUint32 = (value: number) => value >>> 0;

const md5Constants = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32)
);

const md5Shifts = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const toBase64 = (bytes: Uint8Array) => {
  if (typeof btoa !== "undefined") {
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }
  return Buffer.from(bytes).toString("base64");
};

const md5 = (data: ArrayBuffer) => {
  const input = new Uint8Array(data);
  const bitLength = input.length * 8;

  const withPaddingLength = ((input.length + 9 + 63) >> 6) << 6;
  const padded = new Uint8Array(withPaddingLength);
  padded.set(input);
  padded[input.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(withPaddingLength - 8, bitLength >>> 0, true);
  view.setUint32(
    withPaddingLength - 4,
    Math.floor(bitLength / 2 ** 32),
    true
  );

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < withPaddingLength; offset += 64) {
    const chunk = new DataView(padded.buffer, offset, 64);
    const m = new Array<number>(16);
    for (let i = 0; i < 16; i++) {
      m[i] = chunk.getUint32(i * 4, true);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;

      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      const sum = toUint32(a + f + md5Constants[i] + m[g]);
      b = toUint32(b + leftRotate(sum, md5Shifts[i]));
      a = temp;
    }

    a0 = toUint32(a0 + a);
    b0 = toUint32(b0 + b);
    c0 = toUint32(c0 + c);
    d0 = toUint32(d0 + d);
  }

  const digest = new Uint8Array(16);
  const digestView = new DataView(digest.buffer);
  digestView.setUint32(0, a0, true);
  digestView.setUint32(4, b0, true);
  digestView.setUint32(8, c0, true);
  digestView.setUint32(12, d0, true);

  return digest;
};

export const md5Base64 = async (blob: Blob) => {
  const buffer = await blob.arrayBuffer();
  return toBase64(md5(buffer));
};
