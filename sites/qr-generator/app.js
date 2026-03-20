// =============================================================================
// QRコード生成ツール - 完全セルフコンテインドQRエンコーダー
// =============================================================================

// ---------------------------------------------------------------------------
// 1. QR Code Generator (self-contained, no external dependencies)
//    Based on ISO/IEC 18004 - QR Code specification
// ---------------------------------------------------------------------------

const QRCode = (() => {
    // Galois Field GF(2^8) arithmetic for Reed-Solomon error correction
    const GF256 = (() => {
        const EXP = new Uint8Array(512);
        const LOG = new Uint8Array(256);
        let x = 1;
        for (let i = 0; i < 255; i++) {
            EXP[i] = x;
            LOG[x] = i;
            x = (x << 1) ^ (x & 128 ? 0x11d : 0);
        }
        for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
        LOG[0] = 255; // convention

        return {
            mul: (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]],
            polyMul: (p, q) => {
                const r = new Uint8Array(p.length + q.length - 1);
                for (let i = 0; i < p.length; i++) {
                    for (let j = 0; j < q.length; j++) {
                        r[i + j] ^= (p[i] === 0 || q[j] === 0) ? 0 : EXP[LOG[p[i]] + LOG[q[j]]];
                    }
                }
                return r;
            },
            polyMod: (dividend, divisor) => {
                const result = new Uint8Array(dividend);
                for (let i = 0; i < dividend.length - divisor.length + 1; i++) {
                    if (result[i] === 0) continue;
                    const coef = LOG[result[i]];
                    for (let j = 0; j < divisor.length; j++) {
                        if (divisor[j] !== 0) {
                            result[i + j] ^= EXP[coef + LOG[divisor[j]]];
                        }
                    }
                }
                return result.slice(dividend.length - divisor.length + 1);
            },
            generatorPoly: (n) => {
                let g = new Uint8Array([1]);
                for (let i = 0; i < n; i++) {
                    g = GF256.polyMul(g, new Uint8Array([1, EXP[i]]));
                }
                return g;
            }
        };
    })();

    // Error correction codewords per block table
    // [version][ecLevel] => { totalDataCodewords, ecPerBlock, numBlocks (group1), blockDataCW (group1), numBlocks2, blockDataCW2 }
    // Simplified EC table for versions 1-10, error correction level M
    const EC_TABLE = {
        1:  { L: { dc: 19, ec: 7,  b1: 1, d1: 19 }, M: { dc: 16, ec: 10, b1: 1, d1: 16 }, Q: { dc: 13, ec: 13, b1: 1, d1: 13 }, H: { dc: 9,  ec: 17, b1: 1, d1: 9  } },
        2:  { L: { dc: 34, ec: 10, b1: 1, d1: 34 }, M: { dc: 28, ec: 16, b1: 1, d1: 28 }, Q: { dc: 22, ec: 22, b1: 1, d1: 22 }, H: { dc: 16, ec: 28, b1: 1, d1: 16 } },
        3:  { L: { dc: 55, ec: 15, b1: 1, d1: 55 }, M: { dc: 44, ec: 26, b1: 1, d1: 44 }, Q: { dc: 34, ec: 18, b1: 2, d1: 17 }, H: { dc: 26, ec: 22, b1: 2, d1: 13 } },
        4:  { L: { dc: 80, ec: 20, b1: 1, d1: 80 }, M: { dc: 64, ec: 18, b1: 2, d1: 32 }, Q: { dc: 48, ec: 26, b1: 2, d1: 24 }, H: { dc: 36, ec: 16, b1: 4, d1: 9  } },
        5:  { L: { dc:108, ec: 26, b1: 1, d1:108 }, M: { dc: 86, ec: 24, b1: 2, d1: 43 }, Q: { dc: 62, ec: 18, b1: 2, d1: 15, b2: 2, d2: 16 }, H: { dc: 46, ec: 22, b1: 2, d1: 11, b2: 2, d2: 12 } },
        6:  { L: { dc:136, ec: 18, b1: 2, d1: 68 }, M: { dc:108, ec: 16, b1: 4, d1: 27 }, Q: { dc: 76, ec: 24, b1: 4, d1: 19 }, H: { dc: 60, ec: 28, b1: 4, d1: 15 } },
        7:  { L: { dc:156, ec: 20, b1: 2, d1: 78 }, M: { dc:124, ec: 18, b1: 4, d1: 31 }, Q: { dc: 88, ec: 18, b1: 2, d1: 14, b2: 4, d2: 15 }, H: { dc: 66, ec: 26, b1: 4, d1: 13, b2: 1, d2: 14 } },
        8:  { L: { dc:194, ec: 24, b1: 2, d1: 97 }, M: { dc:154, ec: 22, b1: 2, d1: 38, b2: 2, d2: 39 }, Q: { dc:110, ec: 22, b1: 4, d1: 18, b2: 2, d2: 19 }, H: { dc: 86, ec: 26, b1: 4, d1: 14, b2: 2, d2: 15 } },
        9:  { L: { dc:232, ec: 30, b1: 2, d1:116 }, M: { dc:182, ec: 22, b1: 3, d1: 36, b2: 2, d2: 37 }, Q: { dc:132, ec: 20, b1: 4, d1: 16, b2: 4, d2: 17 }, H: { dc:100, ec: 24, b1: 4, d1: 12, b2: 4, d2: 13 } },
        10: { L: { dc:274, ec: 18, b1: 2, d1: 68, b2: 2, d2: 69 }, M: { dc:216, ec: 26, b1: 4, d1: 43, b2: 1, d2: 44 }, Q: { dc:154, ec: 24, b1: 6, d1: 19, b2: 2, d2: 20 }, H: { dc:122, ec: 28, b1: 6, d1: 15, b2: 2, d2: 16 } },
        11: { L: { dc:324, ec: 20, b1: 4, d1: 81 }, M: { dc:254, ec: 30, b1: 1, d1: 50, b2: 4, d2: 51 }, Q: { dc:180, ec: 28, b1: 4, d1: 22, b2: 4, d2: 23 }, H: { dc:140, ec: 24, b1: 3, d1: 12, b2: 8, d2: 13 } },
        12: { L: { dc:370, ec: 24, b1: 2, d1: 92, b2: 2, d2: 93 }, M: { dc:290, ec: 22, b1: 6, d1: 36, b2: 2, d2: 37 }, Q: { dc:206, ec: 26, b1: 4, d1: 20, b2: 6, d2: 21 }, H: { dc:158, ec: 28, b1: 7, d1: 14, b2: 4, d2: 15 } },
        13: { L: { dc:428, ec: 26, b1: 4, d1:107 }, M: { dc:334, ec: 22, b1: 8, d1: 37, b2: 1, d2: 38 }, Q: { dc:244, ec: 24, b1: 8, d1: 20, b2: 4, d2: 21 }, H: { dc:180, ec: 22, b1: 12,d1: 11, b2: 4, d2: 12 } },
        14: { L: { dc:461, ec: 30, b1: 3, d1:115, b2: 1, d2:116 }, M: { dc:365, ec: 24, b1: 4, d1: 40, b2: 5, d2: 41 }, Q: { dc:261, ec: 20, b1: 11,d1: 16, b2: 5, d2: 17 }, H: { dc:197, ec: 24, b1: 11,d1: 12, b2: 5, d2: 13 } },
        15: { L: { dc:523, ec: 22, b1: 5, d1: 87, b2: 1, d2: 88 }, M: { dc:415, ec: 24, b1: 5, d1: 41, b2: 5, d2: 42 }, Q: { dc:295, ec: 30, b1: 5, d1: 24, b2: 7, d2: 25 }, H: { dc:223, ec: 24, b1: 11,d1: 12, b2: 7, d2: 13 } },
        16: { L: { dc:589, ec: 24, b1: 5, d1: 98, b2: 1, d2: 99 }, M: { dc:453, ec: 28, b1: 7, d1: 45, b2: 3, d2: 46 }, Q: { dc:325, ec: 24, b1: 15,d1: 19, b2: 2, d2: 20 }, H: { dc:253, ec: 30, b1: 3, d1: 15, b2:13, d2: 16 } },
        17: { L: { dc:647, ec: 28, b1: 1, d1:107, b2: 5, d2:108 }, M: { dc:507, ec: 28, b1: 10,d1: 46, b2: 1, d2: 47 }, Q: { dc:367, ec: 28, b1: 1, d1: 22, b2:15, d2: 23 }, H: { dc:283, ec: 28, b1: 2, d1: 14, b2:17, d2: 15 } },
        18: { L: { dc:721, ec: 30, b1: 5, d1:120, b2: 1, d2:121 }, M: { dc:563, ec: 26, b1: 9, d1: 43, b2: 4, d2: 44 }, Q: { dc:397, ec: 28, b1: 17,d1: 22, b2: 1, d2: 23 }, H: { dc:313, ec: 28, b1: 2, d1: 14, b2:19, d2: 15 } },
        19: { L: { dc:795, ec: 28, b1: 3, d1:113, b2: 4, d2:114 }, M: { dc:627, ec: 26, b1: 3, d1: 44, b2:11, d2: 45 }, Q: { dc:445, ec: 26, b1: 17,d1: 21, b2: 4, d2: 22 }, H: { dc:341, ec: 26, b1: 9, d1: 13, b2:16, d2: 14 } },
        20: { L: { dc:861, ec: 28, b1: 3, d1:107, b2: 5, d2:108 }, M: { dc:669, ec: 26, b1: 3, d1: 41, b2:13, d2: 42 }, Q: { dc:485, ec: 30, b1: 15,d1: 24, b2: 5, d2: 25 }, H: { dc:385, ec: 28, b1: 15,d1: 15, b2:10, d2: 16 } },
    };

    // Alignment pattern positions per version
    const ALIGNMENT_POSITIONS = {
        2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
        7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
        11: [6, 30, 54], 12: [6, 32, 58], 13: [6, 34, 62], 14: [6, 26, 46, 66],
        15: [6, 26, 48, 70], 16: [6, 26, 50, 74], 17: [6, 30, 54, 78],
        18: [6, 30, 56, 82], 19: [6, 30, 58, 86], 20: [6, 34, 62, 90],
    };

    // Version info bit strings (versions 7+)
    const VERSION_INFO = {
        7: 0x07C94, 8: 0x085BC, 9: 0x09A99, 10: 0x0A4D3,
        11: 0x0BBF6, 12: 0x0C762, 13: 0x0D847, 14: 0x0E60D,
        15: 0x0F928, 16: 0x10B78, 17: 0x1145D, 18: 0x12A17,
        19: 0x13532, 20: 0x149A6,
    };

    // Format info lookup - mask pattern + EC level
    const FORMAT_INFO = (() => {
        // Precomputed format info bits for each EC level and mask
        // format = (ecBits << 3) | maskPattern, then BCH encoded
        const table = {};
        const ecBits = { L: 1, M: 0, Q: 3, H: 2 };
        // Generator polynomial for format info: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1
        function bchFormatInfo(data) {
            let d = data << 10;
            let gen = 0x537; // 10100110111
            for (let i = 4; i >= 0; i--) {
                if (d & (1 << (i + 10))) d ^= gen << i;
            }
            return ((data << 10) | d) ^ 0x5412; // XOR mask
        }
        for (const ec of ['L', 'M', 'Q', 'H']) {
            table[ec] = [];
            for (let mask = 0; mask < 8; mask++) {
                table[ec][mask] = bchFormatInfo((ecBits[ec] << 3) | mask);
            }
        }
        return table;
    })();

    // Byte mode encoding
    function encodeData(text) {
        const bytes = [];
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code < 0x80) {
                bytes.push(code);
            } else if (code < 0x800) {
                bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
            } else if (code < 0x10000) {
                bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
            } else {
                bytes.push(0xF0 | (code >> 18), 0x80 | ((code >> 12) & 0x3F), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
            }
        }
        return bytes;
    }

    // Determine minimum version for data
    function getMinVersion(dataBytes, ecLevel) {
        for (let v = 1; v <= 20; v++) {
            const info = EC_TABLE[v]?.[ecLevel];
            if (!info) continue;
            // Byte mode overhead: 4 (mode) + charCountBits + data
            const charCountBits = v <= 9 ? 8 : 16;
            const totalBits = 4 + charCountBits + dataBytes.length * 8;
            const totalDataBits = info.dc * 8;
            if (totalBits <= totalDataBits) return v;
        }
        return -1; // Too large
    }

    // Build data codewords with byte mode
    function buildDataCodewords(dataBytes, version, ecLevel) {
        const info = EC_TABLE[version][ecLevel];
        const charCountBits = version <= 9 ? 8 : 16;
        const bits = [];

        function pushBits(val, len) {
            for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
        }

        // Mode indicator: 0100 = byte mode
        pushBits(4, 4);
        // Character count
        pushBits(dataBytes.length, charCountBits);
        // Data bytes
        for (const b of dataBytes) pushBits(b, 8);
        // Terminator (up to 4 zeros)
        const totalDataBits = info.dc * 8;
        const terminatorLen = Math.min(4, totalDataBits - bits.length);
        pushBits(0, terminatorLen);
        // Pad to byte boundary
        while (bits.length % 8 !== 0) bits.push(0);
        // Pad bytes
        const padBytes = [0xEC, 0x11];
        let padIdx = 0;
        while (bits.length < totalDataBits) {
            pushBits(padBytes[padIdx % 2], 8);
            padIdx++;
        }

        // Convert bits to bytes
        const codewords = [];
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
            codewords.push(byte);
        }
        return codewords;
    }

    // Split data into blocks and compute EC codewords
    function computeBlocks(dataCodewords, version, ecLevel) {
        const info = EC_TABLE[version][ecLevel];
        const blocks = [];
        let offset = 0;

        const b1 = info.b1 || 0;
        const d1 = info.d1 || 0;
        const b2 = info.b2 || 0;
        const d2 = info.d2 || 0;

        const gen = GF256.generatorPoly(info.ec);

        for (let i = 0; i < b1; i++) {
            const data = dataCodewords.slice(offset, offset + d1);
            offset += d1;
            const padded = new Uint8Array(data.length + info.ec);
            padded.set(data);
            const ec = GF256.polyMod(padded, gen);
            blocks.push({ data: Array.from(data), ec: Array.from(ec) });
        }
        for (let i = 0; i < b2; i++) {
            const data = dataCodewords.slice(offset, offset + d2);
            offset += d2;
            const padded = new Uint8Array(data.length + info.ec);
            padded.set(data);
            const ec = GF256.polyMod(padded, gen);
            blocks.push({ data: Array.from(data), ec: Array.from(ec) });
        }
        return blocks;
    }

    // Interleave blocks into final message
    function interleave(blocks, version, ecLevel) {
        const info = EC_TABLE[version][ecLevel];
        const result = [];

        // Interleave data
        const maxDataLen = Math.max(...blocks.map(b => b.data.length));
        for (let i = 0; i < maxDataLen; i++) {
            for (const block of blocks) {
                if (i < block.data.length) result.push(block.data[i]);
            }
        }
        // Interleave EC
        for (let i = 0; i < info.ec; i++) {
            for (const block of blocks) {
                if (i < block.ec.length) result.push(block.ec[i]);
            }
        }
        return result;
    }

    // QR matrix operations
    function createMatrix(version) {
        const size = version * 4 + 17;
        const matrix = Array.from({ length: size }, () => new Int8Array(size)); // 0=unset, 1=dark, -1=light
        const reserved = Array.from({ length: size }, () => new Uint8Array(size)); // 1=reserved
        return { matrix, reserved, size };
    }

    function placeFinderPattern(m, row, col) {
        for (let r = -1; r <= 7; r++) {
            for (let c = -1; c <= 7; c++) {
                const rr = row + r, cc = col + c;
                if (rr < 0 || rr >= m.size || cc < 0 || cc >= m.size) continue;
                const isBlack = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                                (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                                (r >= 2 && r <= 4 && c >= 2 && c <= 4);
                m.matrix[rr][cc] = isBlack ? 1 : -1;
                m.reserved[rr][cc] = 1;
            }
        }
    }

    function placeAlignmentPattern(m, row, col) {
        for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
                const isBlack = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
                m.matrix[row + r][col + c] = isBlack ? 1 : -1;
                m.reserved[row + r][col + c] = 1;
            }
        }
    }

    function placeTimingPatterns(m) {
        for (let i = 8; i < m.size - 8; i++) {
            const val = (i % 2 === 0) ? 1 : -1;
            if (!m.reserved[6][i]) { m.matrix[6][i] = val; m.reserved[6][i] = 1; }
            if (!m.reserved[i][6]) { m.matrix[i][6] = val; m.reserved[i][6] = 1; }
        }
    }

    function reserveFormatAndVersion(m, version) {
        // Format info areas
        for (let i = 0; i < 8; i++) {
            m.reserved[8][i] = 1;
            m.reserved[8][m.size - 1 - i] = 1;
            m.reserved[i][8] = 1;
            m.reserved[m.size - 1 - i][8] = 1;
        }
        m.reserved[8][8] = 1;
        // Dark module
        m.matrix[m.size - 8][8] = 1;
        m.reserved[m.size - 8][8] = 1;

        // Version info (version >= 7)
        if (version >= 7) {
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 3; j++) {
                    m.reserved[i][m.size - 11 + j] = 1;
                    m.reserved[m.size - 11 + j][i] = 1;
                }
            }
        }
    }

    function placeData(m, messageBits) {
        let bitIdx = 0;
        let upward = true;
        for (let right = m.size - 1; right >= 1; right -= 2) {
            if (right === 6) right = 5; // Skip timing pattern column
            const rows = upward
                ? Array.from({ length: m.size }, (_, i) => m.size - 1 - i)
                : Array.from({ length: m.size }, (_, i) => i);
            for (const row of rows) {
                for (const col of [right, right - 1]) {
                    if (col < 0) continue;
                    if (m.reserved[row][col]) continue;
                    m.matrix[row][col] = (bitIdx < messageBits.length && messageBits[bitIdx] === 1) ? 1 : -1;
                    bitIdx++;
                }
            }
            upward = !upward;
        }
    }

    // Mask patterns
    const MASK_FNS = [
        (r, c) => (r + c) % 2 === 0,
        (r, c) => r % 2 === 0,
        (r, c) => c % 3 === 0,
        (r, c) => (r + c) % 3 === 0,
        (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
        (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
        (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
        (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
    ];

    function applyMask(m, maskIdx) {
        const fn = MASK_FNS[maskIdx];
        for (let r = 0; r < m.size; r++) {
            for (let c = 0; c < m.size; c++) {
                if (!m.reserved[r][c] && fn(r, c)) {
                    m.matrix[r][c] = m.matrix[r][c] === 1 ? -1 : 1;
                }
            }
        }
    }

    function placeFormatInfo(m, ecLevel, maskIdx) {
        const info = FORMAT_INFO[ecLevel][maskIdx];
        const bits = [];
        for (let i = 14; i >= 0; i--) bits.push((info >> i) & 1);

        // Around top-left finder
        const positions1 = [
            [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
            [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
        ];
        // Split between bottom-left and top-right
        const positions2 = [
            [m.size - 1, 8], [m.size - 2, 8], [m.size - 3, 8], [m.size - 4, 8],
            [m.size - 5, 8], [m.size - 6, 8], [m.size - 7, 8],
            [8, m.size - 8], [8, m.size - 7], [8, m.size - 6], [8, m.size - 5],
            [8, m.size - 4], [8, m.size - 3], [8, m.size - 2], [8, m.size - 1]
        ];

        for (let i = 0; i < 15; i++) {
            const val = bits[i] ? 1 : -1;
            m.matrix[positions1[i][0]][positions1[i][1]] = val;
            m.matrix[positions2[i][0]][positions2[i][1]] = val;
        }
    }

    function placeVersionInfo(m, version) {
        if (version < 7) return;
        const info = VERSION_INFO[version];
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                const bit = (info >> (i * 3 + j)) & 1;
                const val = bit ? 1 : -1;
                m.matrix[i][m.size - 11 + j] = val;
                m.matrix[m.size - 11 + j][i] = val;
            }
        }
    }

    // Penalty scoring
    function scorePenalty(m) {
        let penalty = 0;
        const s = m.size;
        const isDark = (r, c) => m.matrix[r][c] === 1;

        // Rule 1: consecutive same-color modules in row/col
        for (let r = 0; r < s; r++) {
            let count = 1;
            for (let c = 1; c < s; c++) {
                if (isDark(r, c) === isDark(r, c - 1)) { count++; }
                else { if (count >= 5) penalty += count - 2; count = 1; }
            }
            if (count >= 5) penalty += count - 2;
        }
        for (let c = 0; c < s; c++) {
            let count = 1;
            for (let r = 1; r < s; r++) {
                if (isDark(r, c) === isDark(r - 1, c)) { count++; }
                else { if (count >= 5) penalty += count - 2; count = 1; }
            }
            if (count >= 5) penalty += count - 2;
        }

        // Rule 2: 2x2 blocks
        for (let r = 0; r < s - 1; r++) {
            for (let c = 0; c < s - 1; c++) {
                const d = isDark(r, c);
                if (d === isDark(r, c + 1) && d === isDark(r + 1, c) && d === isDark(r + 1, c + 1)) {
                    penalty += 3;
                }
            }
        }

        // Rule 3: finder-like patterns
        const pattern1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
        const pattern2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
        for (let r = 0; r < s; r++) {
            for (let c = 0; c <= s - 11; c++) {
                let match1 = true, match2 = true;
                for (let i = 0; i < 11; i++) {
                    const d = isDark(r, c + i) ? 1 : 0;
                    if (d !== pattern1[i]) match1 = false;
                    if (d !== pattern2[i]) match2 = false;
                }
                if (match1) penalty += 40;
                if (match2) penalty += 40;
            }
        }
        for (let c = 0; c < s; c++) {
            for (let r = 0; r <= s - 11; r++) {
                let match1 = true, match2 = true;
                for (let i = 0; i < 11; i++) {
                    const d = isDark(r + i, c) ? 1 : 0;
                    if (d !== pattern1[i]) match1 = false;
                    if (d !== pattern2[i]) match2 = false;
                }
                if (match1) penalty += 40;
                if (match2) penalty += 40;
            }
        }

        // Rule 4: proportion of dark modules
        let darkCount = 0;
        for (let r = 0; r < s; r++) for (let c = 0; c < s; c++) if (isDark(r, c)) darkCount++;
        const pct = (darkCount / (s * s)) * 100;
        const prev5 = Math.floor(pct / 5) * 5;
        const next5 = prev5 + 5;
        penalty += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

        return penalty;
    }

    // Main generate function
    function generate(text, ecLevel = 'M') {
        const dataBytes = encodeData(text);
        const version = getMinVersion(dataBytes, ecLevel);
        if (version < 0) throw new Error('データが大きすぎます（最大バージョン20）');

        const dataCodewords = buildDataCodewords(dataBytes, version, ecLevel);
        const blocks = computeBlocks(dataCodewords, version, ecLevel);
        const message = interleave(blocks, version, ecLevel);

        // Convert to bits
        const messageBits = [];
        for (const byte of message) {
            for (let i = 7; i >= 0; i--) messageBits.push((byte >> i) & 1);
        }

        // Try all 8 masks, pick best
        let bestMask = 0;
        let bestPenalty = Infinity;
        let bestMatrix = null;

        for (let maskIdx = 0; maskIdx < 8; maskIdx++) {
            const m = createMatrix(version);

            // Place patterns
            placeFinderPattern(m, 0, 0);
            placeFinderPattern(m, 0, m.size - 7);
            placeFinderPattern(m, m.size - 7, 0);

            if (ALIGNMENT_POSITIONS[version]) {
                const pos = ALIGNMENT_POSITIONS[version];
                for (const r of pos) {
                    for (const c of pos) {
                        // Skip if overlapping finder patterns
                        if (r <= 8 && c <= 8) continue;
                        if (r <= 8 && c >= m.size - 8) continue;
                        if (r >= m.size - 8 && c <= 8) continue;
                        placeAlignmentPattern(m, r, c);
                    }
                }
            }

            placeTimingPatterns(m);
            reserveFormatAndVersion(m, version);
            placeData(m, messageBits);
            applyMask(m, maskIdx);
            placeFormatInfo(m, ecLevel, maskIdx);
            placeVersionInfo(m, version);

            const penalty = scorePenalty(m);
            if (penalty < bestPenalty) {
                bestPenalty = penalty;
                bestMask = maskIdx;
                bestMatrix = m;
            }
        }

        // Convert to boolean grid (true = dark)
        const grid = [];
        for (let r = 0; r < bestMatrix.size; r++) {
            const row = [];
            for (let c = 0; c < bestMatrix.size; c++) {
                row.push(bestMatrix.matrix[r][c] === 1);
            }
            grid.push(row);
        }

        return { grid, size: bestMatrix.size, version };
    }

    return { generate };
})();


// ---------------------------------------------------------------------------
// 2. Canvas rendering
// ---------------------------------------------------------------------------

function renderQRToCanvas(canvas, grid, pixelSize, fgColor, bgColor) {
    const moduleCount = grid.length;
    const quietZone = 4; // quiet zone in modules
    const totalModules = moduleCount + quietZone * 2;
    const canvasSize = totalModules * pixelSize;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Modules
    ctx.fillStyle = fgColor;
    for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
            if (grid[r][c]) {
                ctx.fillRect(
                    (c + quietZone) * pixelSize,
                    (r + quietZone) * pixelSize,
                    pixelSize,
                    pixelSize
                );
            }
        }
    }
}


// ---------------------------------------------------------------------------
// 3. UI Logic
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const inputType = document.getElementById('input-type');
    const inputLabel = document.getElementById('input-label');
    const inputText = document.getElementById('input-text');
    const fieldMain = document.getElementById('field-main');
    const wifiFields = document.getElementById('wifi-fields');
    const qrSize = document.getElementById('qr-size');
    const fgColor = document.getElementById('fg-color');
    const bgColor = document.getElementById('bg-color');
    const generateBtn = document.getElementById('generate-btn');
    const qrOutput = document.getElementById('qr-output');
    const qrCanvas = document.getElementById('qr-canvas');
    const actionButtons = document.getElementById('action-buttons');
    const downloadBtn = document.getElementById('download-btn');
    const printBtn = document.getElementById('print-btn');

    const typeConfig = {
        url:   { label: 'URL',    placeholder: 'https://example.com' },
        text:  { label: 'テキスト', placeholder: 'ここにテキストを入力...' },
        email: { label: 'メールアドレス', placeholder: 'user@example.com' },
        phone: { label: '電話番号', placeholder: '+81-90-1234-5678' },
        wifi:  { label: null, placeholder: null },
    };

    const sizeMap = { small: 5, medium: 8, large: 10 };

    // Switch input type
    inputType.addEventListener('change', () => {
        const type = inputType.value;
        if (type === 'wifi') {
            fieldMain.style.display = 'none';
            wifiFields.style.display = 'block';
        } else {
            fieldMain.style.display = 'block';
            wifiFields.style.display = 'none';
            inputLabel.textContent = typeConfig[type].label;
            inputText.placeholder = typeConfig[type].placeholder;
        }
    });

    function getInputData() {
        const type = inputType.value;
        if (type === 'wifi') {
            const ssid = document.getElementById('wifi-ssid').value.trim();
            const pass = document.getElementById('wifi-password').value;
            const enc = document.getElementById('wifi-encryption').value;
            const hidden = document.getElementById('wifi-hidden').checked;
            if (!ssid) return null;
            // WiFi QR code format
            return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden ? 'true' : 'false'};;`;
        }
        const text = inputText.value.trim();
        if (!text) return null;
        if (type === 'email') return `mailto:${text}`;
        if (type === 'phone') return `tel:${text}`;
        return text;
    }

    function doGenerate() {
        const data = getInputData();
        if (!data) {
            qrOutput.innerHTML = '<p class="error-text">入力内容を入力してください</p>';
            actionButtons.style.display = 'none';
            return;
        }

        try {
            const { grid } = QRCode.generate(data, 'M');
            const pixelSize = sizeMap[qrSize.value] || 8;

            renderQRToCanvas(qrCanvas, grid, pixelSize, fgColor.value, bgColor.value);

            // Show as image in output div
            const imgUrl = qrCanvas.toDataURL('image/png');
            qrOutput.innerHTML = `<img src="${imgUrl}" alt="QRコード">`;
            actionButtons.style.display = 'flex';
        } catch (e) {
            qrOutput.innerHTML = `<p class="error-text">エラー: ${e.message}</p>`;
            actionButtons.style.display = 'none';
        }
    }

    generateBtn.addEventListener('click', doGenerate);

    // Also generate on Enter in text fields
    inputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            doGenerate();
        }
    });

    // Re-generate on setting changes if QR exists
    function autoRegenerate() {
        if (actionButtons.style.display !== 'none') doGenerate();
    }
    qrSize.addEventListener('change', autoRegenerate);
    fgColor.addEventListener('input', autoRegenerate);
    bgColor.addEventListener('input', autoRegenerate);

    // Download
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = qrCanvas.toDataURL('image/png');
        link.click();
    });

    // Print
    printBtn.addEventListener('click', () => {
        window.print();
    });
});
