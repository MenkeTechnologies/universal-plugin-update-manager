//! Grid tests for `history::radix_string` — expected from reference Python (same algorithm as Rust).
use app_lib::history::radix_string;

#[test]
fn radix_b2_n000() {
    assert_eq!(radix_string(0u64, 2u64), "0");
}

#[test]
fn radix_b2_n001() {
    assert_eq!(radix_string(1u64, 2u64), "1");
}

#[test]
fn radix_b2_n002() {
    assert_eq!(radix_string(2u64, 2u64), "10");
}

#[test]
fn radix_b2_n003() {
    assert_eq!(radix_string(3u64, 2u64), "11");
}

#[test]
fn radix_b2_n004() {
    assert_eq!(radix_string(4u64, 2u64), "100");
}

#[test]
fn radix_b2_n005() {
    assert_eq!(radix_string(5u64, 2u64), "101");
}

#[test]
fn radix_b2_n006() {
    assert_eq!(radix_string(6u64, 2u64), "110");
}

#[test]
fn radix_b2_n007() {
    assert_eq!(radix_string(7u64, 2u64), "111");
}

#[test]
fn radix_b2_n008() {
    assert_eq!(radix_string(8u64, 2u64), "1000");
}

#[test]
fn radix_b2_n009() {
    assert_eq!(radix_string(9u64, 2u64), "1001");
}

#[test]
fn radix_b2_n010() {
    assert_eq!(radix_string(10u64, 2u64), "1010");
}

#[test]
fn radix_b2_n011() {
    assert_eq!(radix_string(11u64, 2u64), "1011");
}

#[test]
fn radix_b2_n012() {
    assert_eq!(radix_string(12u64, 2u64), "1100");
}

#[test]
fn radix_b2_n013() {
    assert_eq!(radix_string(13u64, 2u64), "1101");
}

#[test]
fn radix_b2_n014() {
    assert_eq!(radix_string(14u64, 2u64), "1110");
}

#[test]
fn radix_b2_n015() {
    assert_eq!(radix_string(15u64, 2u64), "1111");
}

#[test]
fn radix_b2_n016() {
    assert_eq!(radix_string(16u64, 2u64), "10000");
}

#[test]
fn radix_b2_n017() {
    assert_eq!(radix_string(17u64, 2u64), "10001");
}

#[test]
fn radix_b2_n018() {
    assert_eq!(radix_string(18u64, 2u64), "10010");
}

#[test]
fn radix_b2_n019() {
    assert_eq!(radix_string(19u64, 2u64), "10011");
}

#[test]
fn radix_b2_n020() {
    assert_eq!(radix_string(20u64, 2u64), "10100");
}

#[test]
fn radix_b2_n021() {
    assert_eq!(radix_string(21u64, 2u64), "10101");
}

#[test]
fn radix_b2_n022() {
    assert_eq!(radix_string(22u64, 2u64), "10110");
}

#[test]
fn radix_b2_n023() {
    assert_eq!(radix_string(23u64, 2u64), "10111");
}

#[test]
fn radix_b2_n024() {
    assert_eq!(radix_string(24u64, 2u64), "11000");
}

#[test]
fn radix_b2_n025() {
    assert_eq!(radix_string(25u64, 2u64), "11001");
}

#[test]
fn radix_b2_n026() {
    assert_eq!(radix_string(26u64, 2u64), "11010");
}

#[test]
fn radix_b2_n027() {
    assert_eq!(radix_string(27u64, 2u64), "11011");
}

#[test]
fn radix_b2_n028() {
    assert_eq!(radix_string(28u64, 2u64), "11100");
}

#[test]
fn radix_b2_n029() {
    assert_eq!(radix_string(29u64, 2u64), "11101");
}

#[test]
fn radix_b2_n030() {
    assert_eq!(radix_string(30u64, 2u64), "11110");
}

#[test]
fn radix_b2_n031() {
    assert_eq!(radix_string(31u64, 2u64), "11111");
}

#[test]
fn radix_b2_n032() {
    assert_eq!(radix_string(32u64, 2u64), "100000");
}

#[test]
fn radix_b2_n033() {
    assert_eq!(radix_string(33u64, 2u64), "100001");
}

#[test]
fn radix_b2_n034() {
    assert_eq!(radix_string(34u64, 2u64), "100010");
}

#[test]
fn radix_b2_n035() {
    assert_eq!(radix_string(35u64, 2u64), "100011");
}

#[test]
fn radix_b2_n036() {
    assert_eq!(radix_string(36u64, 2u64), "100100");
}

#[test]
fn radix_b2_n037() {
    assert_eq!(radix_string(37u64, 2u64), "100101");
}

#[test]
fn radix_b2_n038() {
    assert_eq!(radix_string(38u64, 2u64), "100110");
}

#[test]
fn radix_b2_n039() {
    assert_eq!(radix_string(39u64, 2u64), "100111");
}

#[test]
fn radix_b2_n040() {
    assert_eq!(radix_string(40u64, 2u64), "101000");
}

#[test]
fn radix_b2_n041() {
    assert_eq!(radix_string(41u64, 2u64), "101001");
}

#[test]
fn radix_b2_n042() {
    assert_eq!(radix_string(42u64, 2u64), "101010");
}

#[test]
fn radix_b2_n043() {
    assert_eq!(radix_string(43u64, 2u64), "101011");
}

#[test]
fn radix_b2_n044() {
    assert_eq!(radix_string(44u64, 2u64), "101100");
}

#[test]
fn radix_b2_n045() {
    assert_eq!(radix_string(45u64, 2u64), "101101");
}

#[test]
fn radix_b2_n046() {
    assert_eq!(radix_string(46u64, 2u64), "101110");
}

#[test]
fn radix_b2_n047() {
    assert_eq!(radix_string(47u64, 2u64), "101111");
}

#[test]
fn radix_b2_n048() {
    assert_eq!(radix_string(48u64, 2u64), "110000");
}

#[test]
fn radix_b2_n049() {
    assert_eq!(radix_string(49u64, 2u64), "110001");
}

#[test]
fn radix_b2_n050() {
    assert_eq!(radix_string(50u64, 2u64), "110010");
}

#[test]
fn radix_b2_n051() {
    assert_eq!(radix_string(51u64, 2u64), "110011");
}

#[test]
fn radix_b2_n052() {
    assert_eq!(radix_string(52u64, 2u64), "110100");
}

#[test]
fn radix_b2_n053() {
    assert_eq!(radix_string(53u64, 2u64), "110101");
}

#[test]
fn radix_b2_n054() {
    assert_eq!(radix_string(54u64, 2u64), "110110");
}

#[test]
fn radix_b2_n055() {
    assert_eq!(radix_string(55u64, 2u64), "110111");
}

#[test]
fn radix_b2_n056() {
    assert_eq!(radix_string(56u64, 2u64), "111000");
}

#[test]
fn radix_b2_n057() {
    assert_eq!(radix_string(57u64, 2u64), "111001");
}

#[test]
fn radix_b2_n058() {
    assert_eq!(radix_string(58u64, 2u64), "111010");
}

#[test]
fn radix_b2_n059() {
    assert_eq!(radix_string(59u64, 2u64), "111011");
}

#[test]
fn radix_b2_n060() {
    assert_eq!(radix_string(60u64, 2u64), "111100");
}

#[test]
fn radix_b2_n061() {
    assert_eq!(radix_string(61u64, 2u64), "111101");
}

#[test]
fn radix_b2_n062() {
    assert_eq!(radix_string(62u64, 2u64), "111110");
}

#[test]
fn radix_b2_n063() {
    assert_eq!(radix_string(63u64, 2u64), "111111");
}

#[test]
fn radix_b2_n064() {
    assert_eq!(radix_string(64u64, 2u64), "1000000");
}

#[test]
fn radix_b2_n065() {
    assert_eq!(radix_string(65u64, 2u64), "1000001");
}

#[test]
fn radix_b2_n066() {
    assert_eq!(radix_string(66u64, 2u64), "1000010");
}

#[test]
fn radix_b2_n067() {
    assert_eq!(radix_string(67u64, 2u64), "1000011");
}

#[test]
fn radix_b2_n068() {
    assert_eq!(radix_string(68u64, 2u64), "1000100");
}

#[test]
fn radix_b2_n069() {
    assert_eq!(radix_string(69u64, 2u64), "1000101");
}

#[test]
fn radix_b2_n070() {
    assert_eq!(radix_string(70u64, 2u64), "1000110");
}

#[test]
fn radix_b2_n071() {
    assert_eq!(radix_string(71u64, 2u64), "1000111");
}

#[test]
fn radix_b2_n072() {
    assert_eq!(radix_string(72u64, 2u64), "1001000");
}

#[test]
fn radix_b2_n073() {
    assert_eq!(radix_string(73u64, 2u64), "1001001");
}

#[test]
fn radix_b2_n074() {
    assert_eq!(radix_string(74u64, 2u64), "1001010");
}

#[test]
fn radix_b2_n075() {
    assert_eq!(radix_string(75u64, 2u64), "1001011");
}

#[test]
fn radix_b2_n076() {
    assert_eq!(radix_string(76u64, 2u64), "1001100");
}

#[test]
fn radix_b2_n077() {
    assert_eq!(radix_string(77u64, 2u64), "1001101");
}

#[test]
fn radix_b2_n078() {
    assert_eq!(radix_string(78u64, 2u64), "1001110");
}

#[test]
fn radix_b2_n079() {
    assert_eq!(radix_string(79u64, 2u64), "1001111");
}

#[test]
fn radix_b2_n080() {
    assert_eq!(radix_string(80u64, 2u64), "1010000");
}

#[test]
fn radix_b2_n081() {
    assert_eq!(radix_string(81u64, 2u64), "1010001");
}

#[test]
fn radix_b2_n082() {
    assert_eq!(radix_string(82u64, 2u64), "1010010");
}

#[test]
fn radix_b2_n083() {
    assert_eq!(radix_string(83u64, 2u64), "1010011");
}

#[test]
fn radix_b2_n084() {
    assert_eq!(radix_string(84u64, 2u64), "1010100");
}

#[test]
fn radix_b2_n085() {
    assert_eq!(radix_string(85u64, 2u64), "1010101");
}

#[test]
fn radix_b2_n086() {
    assert_eq!(radix_string(86u64, 2u64), "1010110");
}

#[test]
fn radix_b2_n087() {
    assert_eq!(radix_string(87u64, 2u64), "1010111");
}

#[test]
fn radix_b2_n088() {
    assert_eq!(radix_string(88u64, 2u64), "1011000");
}

#[test]
fn radix_b2_n089() {
    assert_eq!(radix_string(89u64, 2u64), "1011001");
}

#[test]
fn radix_b2_n090() {
    assert_eq!(radix_string(90u64, 2u64), "1011010");
}

#[test]
fn radix_b2_n091() {
    assert_eq!(radix_string(91u64, 2u64), "1011011");
}

#[test]
fn radix_b2_n092() {
    assert_eq!(radix_string(92u64, 2u64), "1011100");
}

#[test]
fn radix_b2_n093() {
    assert_eq!(radix_string(93u64, 2u64), "1011101");
}

#[test]
fn radix_b2_n094() {
    assert_eq!(radix_string(94u64, 2u64), "1011110");
}

#[test]
fn radix_b2_n095() {
    assert_eq!(radix_string(95u64, 2u64), "1011111");
}

#[test]
fn radix_b2_n096() {
    assert_eq!(radix_string(96u64, 2u64), "1100000");
}

#[test]
fn radix_b2_n097() {
    assert_eq!(radix_string(97u64, 2u64), "1100001");
}

#[test]
fn radix_b2_n098() {
    assert_eq!(radix_string(98u64, 2u64), "1100010");
}

#[test]
fn radix_b2_n099() {
    assert_eq!(radix_string(99u64, 2u64), "1100011");
}

#[test]
fn radix_b2_n100() {
    assert_eq!(radix_string(100u64, 2u64), "1100100");
}

#[test]
fn radix_b2_n101() {
    assert_eq!(radix_string(101u64, 2u64), "1100101");
}

#[test]
fn radix_b2_n102() {
    assert_eq!(radix_string(102u64, 2u64), "1100110");
}

#[test]
fn radix_b2_n103() {
    assert_eq!(radix_string(103u64, 2u64), "1100111");
}

#[test]
fn radix_b2_n104() {
    assert_eq!(radix_string(104u64, 2u64), "1101000");
}

#[test]
fn radix_b2_n105() {
    assert_eq!(radix_string(105u64, 2u64), "1101001");
}

#[test]
fn radix_b2_n106() {
    assert_eq!(radix_string(106u64, 2u64), "1101010");
}

#[test]
fn radix_b2_n107() {
    assert_eq!(radix_string(107u64, 2u64), "1101011");
}

#[test]
fn radix_b2_n108() {
    assert_eq!(radix_string(108u64, 2u64), "1101100");
}

#[test]
fn radix_b2_n109() {
    assert_eq!(radix_string(109u64, 2u64), "1101101");
}

#[test]
fn radix_b2_n110() {
    assert_eq!(radix_string(110u64, 2u64), "1101110");
}

#[test]
fn radix_b2_n111() {
    assert_eq!(radix_string(111u64, 2u64), "1101111");
}

#[test]
fn radix_b2_n112() {
    assert_eq!(radix_string(112u64, 2u64), "1110000");
}

#[test]
fn radix_b2_n113() {
    assert_eq!(radix_string(113u64, 2u64), "1110001");
}

#[test]
fn radix_b2_n114() {
    assert_eq!(radix_string(114u64, 2u64), "1110010");
}

#[test]
fn radix_b2_n115() {
    assert_eq!(radix_string(115u64, 2u64), "1110011");
}

#[test]
fn radix_b2_n116() {
    assert_eq!(radix_string(116u64, 2u64), "1110100");
}

#[test]
fn radix_b2_n117() {
    assert_eq!(radix_string(117u64, 2u64), "1110101");
}

#[test]
fn radix_b2_n118() {
    assert_eq!(radix_string(118u64, 2u64), "1110110");
}

#[test]
fn radix_b2_n119() {
    assert_eq!(radix_string(119u64, 2u64), "1110111");
}

#[test]
fn radix_b3_n000() {
    assert_eq!(radix_string(0u64, 3u64), "0");
}

#[test]
fn radix_b3_n001() {
    assert_eq!(radix_string(1u64, 3u64), "1");
}

#[test]
fn radix_b3_n002() {
    assert_eq!(radix_string(2u64, 3u64), "2");
}

#[test]
fn radix_b3_n003() {
    assert_eq!(radix_string(3u64, 3u64), "10");
}

#[test]
fn radix_b3_n004() {
    assert_eq!(radix_string(4u64, 3u64), "11");
}

#[test]
fn radix_b3_n005() {
    assert_eq!(radix_string(5u64, 3u64), "12");
}

#[test]
fn radix_b3_n006() {
    assert_eq!(radix_string(6u64, 3u64), "20");
}

#[test]
fn radix_b3_n007() {
    assert_eq!(radix_string(7u64, 3u64), "21");
}

#[test]
fn radix_b3_n008() {
    assert_eq!(radix_string(8u64, 3u64), "22");
}

#[test]
fn radix_b3_n009() {
    assert_eq!(radix_string(9u64, 3u64), "100");
}

#[test]
fn radix_b3_n010() {
    assert_eq!(radix_string(10u64, 3u64), "101");
}

#[test]
fn radix_b3_n011() {
    assert_eq!(radix_string(11u64, 3u64), "102");
}

#[test]
fn radix_b3_n012() {
    assert_eq!(radix_string(12u64, 3u64), "110");
}

#[test]
fn radix_b3_n013() {
    assert_eq!(radix_string(13u64, 3u64), "111");
}

#[test]
fn radix_b3_n014() {
    assert_eq!(radix_string(14u64, 3u64), "112");
}

#[test]
fn radix_b3_n015() {
    assert_eq!(radix_string(15u64, 3u64), "120");
}

#[test]
fn radix_b3_n016() {
    assert_eq!(radix_string(16u64, 3u64), "121");
}

#[test]
fn radix_b3_n017() {
    assert_eq!(radix_string(17u64, 3u64), "122");
}

#[test]
fn radix_b3_n018() {
    assert_eq!(radix_string(18u64, 3u64), "200");
}

#[test]
fn radix_b3_n019() {
    assert_eq!(radix_string(19u64, 3u64), "201");
}

#[test]
fn radix_b3_n020() {
    assert_eq!(radix_string(20u64, 3u64), "202");
}

#[test]
fn radix_b3_n021() {
    assert_eq!(radix_string(21u64, 3u64), "210");
}

#[test]
fn radix_b3_n022() {
    assert_eq!(radix_string(22u64, 3u64), "211");
}

#[test]
fn radix_b3_n023() {
    assert_eq!(radix_string(23u64, 3u64), "212");
}

#[test]
fn radix_b3_n024() {
    assert_eq!(radix_string(24u64, 3u64), "220");
}

#[test]
fn radix_b3_n025() {
    assert_eq!(radix_string(25u64, 3u64), "221");
}

#[test]
fn radix_b3_n026() {
    assert_eq!(radix_string(26u64, 3u64), "222");
}

#[test]
fn radix_b3_n027() {
    assert_eq!(radix_string(27u64, 3u64), "1000");
}

#[test]
fn radix_b3_n028() {
    assert_eq!(radix_string(28u64, 3u64), "1001");
}

#[test]
fn radix_b3_n029() {
    assert_eq!(radix_string(29u64, 3u64), "1002");
}

#[test]
fn radix_b3_n030() {
    assert_eq!(radix_string(30u64, 3u64), "1010");
}

#[test]
fn radix_b3_n031() {
    assert_eq!(radix_string(31u64, 3u64), "1011");
}

#[test]
fn radix_b3_n032() {
    assert_eq!(radix_string(32u64, 3u64), "1012");
}

#[test]
fn radix_b3_n033() {
    assert_eq!(radix_string(33u64, 3u64), "1020");
}

#[test]
fn radix_b3_n034() {
    assert_eq!(radix_string(34u64, 3u64), "1021");
}

#[test]
fn radix_b3_n035() {
    assert_eq!(radix_string(35u64, 3u64), "1022");
}

#[test]
fn radix_b3_n036() {
    assert_eq!(radix_string(36u64, 3u64), "1100");
}

#[test]
fn radix_b3_n037() {
    assert_eq!(radix_string(37u64, 3u64), "1101");
}

#[test]
fn radix_b3_n038() {
    assert_eq!(radix_string(38u64, 3u64), "1102");
}

#[test]
fn radix_b3_n039() {
    assert_eq!(radix_string(39u64, 3u64), "1110");
}

#[test]
fn radix_b3_n040() {
    assert_eq!(radix_string(40u64, 3u64), "1111");
}

#[test]
fn radix_b3_n041() {
    assert_eq!(radix_string(41u64, 3u64), "1112");
}

#[test]
fn radix_b3_n042() {
    assert_eq!(radix_string(42u64, 3u64), "1120");
}

#[test]
fn radix_b3_n043() {
    assert_eq!(radix_string(43u64, 3u64), "1121");
}

#[test]
fn radix_b3_n044() {
    assert_eq!(radix_string(44u64, 3u64), "1122");
}

#[test]
fn radix_b3_n045() {
    assert_eq!(radix_string(45u64, 3u64), "1200");
}

#[test]
fn radix_b3_n046() {
    assert_eq!(radix_string(46u64, 3u64), "1201");
}

#[test]
fn radix_b3_n047() {
    assert_eq!(radix_string(47u64, 3u64), "1202");
}

#[test]
fn radix_b3_n048() {
    assert_eq!(radix_string(48u64, 3u64), "1210");
}

#[test]
fn radix_b3_n049() {
    assert_eq!(radix_string(49u64, 3u64), "1211");
}

#[test]
fn radix_b3_n050() {
    assert_eq!(radix_string(50u64, 3u64), "1212");
}

#[test]
fn radix_b3_n051() {
    assert_eq!(radix_string(51u64, 3u64), "1220");
}

#[test]
fn radix_b3_n052() {
    assert_eq!(radix_string(52u64, 3u64), "1221");
}

#[test]
fn radix_b3_n053() {
    assert_eq!(radix_string(53u64, 3u64), "1222");
}

#[test]
fn radix_b3_n054() {
    assert_eq!(radix_string(54u64, 3u64), "2000");
}

#[test]
fn radix_b3_n055() {
    assert_eq!(radix_string(55u64, 3u64), "2001");
}

#[test]
fn radix_b3_n056() {
    assert_eq!(radix_string(56u64, 3u64), "2002");
}

#[test]
fn radix_b3_n057() {
    assert_eq!(radix_string(57u64, 3u64), "2010");
}

#[test]
fn radix_b3_n058() {
    assert_eq!(radix_string(58u64, 3u64), "2011");
}

#[test]
fn radix_b3_n059() {
    assert_eq!(radix_string(59u64, 3u64), "2012");
}

#[test]
fn radix_b3_n060() {
    assert_eq!(radix_string(60u64, 3u64), "2020");
}

#[test]
fn radix_b3_n061() {
    assert_eq!(radix_string(61u64, 3u64), "2021");
}

#[test]
fn radix_b3_n062() {
    assert_eq!(radix_string(62u64, 3u64), "2022");
}

#[test]
fn radix_b3_n063() {
    assert_eq!(radix_string(63u64, 3u64), "2100");
}

#[test]
fn radix_b3_n064() {
    assert_eq!(radix_string(64u64, 3u64), "2101");
}

#[test]
fn radix_b3_n065() {
    assert_eq!(radix_string(65u64, 3u64), "2102");
}

#[test]
fn radix_b3_n066() {
    assert_eq!(radix_string(66u64, 3u64), "2110");
}

#[test]
fn radix_b3_n067() {
    assert_eq!(radix_string(67u64, 3u64), "2111");
}

#[test]
fn radix_b3_n068() {
    assert_eq!(radix_string(68u64, 3u64), "2112");
}

#[test]
fn radix_b3_n069() {
    assert_eq!(radix_string(69u64, 3u64), "2120");
}

#[test]
fn radix_b3_n070() {
    assert_eq!(radix_string(70u64, 3u64), "2121");
}

#[test]
fn radix_b3_n071() {
    assert_eq!(radix_string(71u64, 3u64), "2122");
}

#[test]
fn radix_b3_n072() {
    assert_eq!(radix_string(72u64, 3u64), "2200");
}

#[test]
fn radix_b3_n073() {
    assert_eq!(radix_string(73u64, 3u64), "2201");
}

#[test]
fn radix_b3_n074() {
    assert_eq!(radix_string(74u64, 3u64), "2202");
}

#[test]
fn radix_b3_n075() {
    assert_eq!(radix_string(75u64, 3u64), "2210");
}

#[test]
fn radix_b3_n076() {
    assert_eq!(radix_string(76u64, 3u64), "2211");
}

#[test]
fn radix_b3_n077() {
    assert_eq!(radix_string(77u64, 3u64), "2212");
}

#[test]
fn radix_b3_n078() {
    assert_eq!(radix_string(78u64, 3u64), "2220");
}

#[test]
fn radix_b3_n079() {
    assert_eq!(radix_string(79u64, 3u64), "2221");
}

#[test]
fn radix_b3_n080() {
    assert_eq!(radix_string(80u64, 3u64), "2222");
}

#[test]
fn radix_b3_n081() {
    assert_eq!(radix_string(81u64, 3u64), "10000");
}

#[test]
fn radix_b3_n082() {
    assert_eq!(radix_string(82u64, 3u64), "10001");
}

#[test]
fn radix_b3_n083() {
    assert_eq!(radix_string(83u64, 3u64), "10002");
}

#[test]
fn radix_b3_n084() {
    assert_eq!(radix_string(84u64, 3u64), "10010");
}

#[test]
fn radix_b3_n085() {
    assert_eq!(radix_string(85u64, 3u64), "10011");
}

#[test]
fn radix_b3_n086() {
    assert_eq!(radix_string(86u64, 3u64), "10012");
}

#[test]
fn radix_b3_n087() {
    assert_eq!(radix_string(87u64, 3u64), "10020");
}

#[test]
fn radix_b3_n088() {
    assert_eq!(radix_string(88u64, 3u64), "10021");
}

#[test]
fn radix_b3_n089() {
    assert_eq!(radix_string(89u64, 3u64), "10022");
}

#[test]
fn radix_b3_n090() {
    assert_eq!(radix_string(90u64, 3u64), "10100");
}

#[test]
fn radix_b3_n091() {
    assert_eq!(radix_string(91u64, 3u64), "10101");
}

#[test]
fn radix_b3_n092() {
    assert_eq!(radix_string(92u64, 3u64), "10102");
}

#[test]
fn radix_b3_n093() {
    assert_eq!(radix_string(93u64, 3u64), "10110");
}

#[test]
fn radix_b3_n094() {
    assert_eq!(radix_string(94u64, 3u64), "10111");
}

#[test]
fn radix_b3_n095() {
    assert_eq!(radix_string(95u64, 3u64), "10112");
}

#[test]
fn radix_b3_n096() {
    assert_eq!(radix_string(96u64, 3u64), "10120");
}

#[test]
fn radix_b3_n097() {
    assert_eq!(radix_string(97u64, 3u64), "10121");
}

#[test]
fn radix_b3_n098() {
    assert_eq!(radix_string(98u64, 3u64), "10122");
}

#[test]
fn radix_b3_n099() {
    assert_eq!(radix_string(99u64, 3u64), "10200");
}

#[test]
fn radix_b3_n100() {
    assert_eq!(radix_string(100u64, 3u64), "10201");
}

#[test]
fn radix_b3_n101() {
    assert_eq!(radix_string(101u64, 3u64), "10202");
}

#[test]
fn radix_b3_n102() {
    assert_eq!(radix_string(102u64, 3u64), "10210");
}

#[test]
fn radix_b3_n103() {
    assert_eq!(radix_string(103u64, 3u64), "10211");
}

#[test]
fn radix_b3_n104() {
    assert_eq!(radix_string(104u64, 3u64), "10212");
}

#[test]
fn radix_b3_n105() {
    assert_eq!(radix_string(105u64, 3u64), "10220");
}

#[test]
fn radix_b3_n106() {
    assert_eq!(radix_string(106u64, 3u64), "10221");
}

#[test]
fn radix_b3_n107() {
    assert_eq!(radix_string(107u64, 3u64), "10222");
}

#[test]
fn radix_b3_n108() {
    assert_eq!(radix_string(108u64, 3u64), "11000");
}

#[test]
fn radix_b3_n109() {
    assert_eq!(radix_string(109u64, 3u64), "11001");
}

#[test]
fn radix_b3_n110() {
    assert_eq!(radix_string(110u64, 3u64), "11002");
}

#[test]
fn radix_b3_n111() {
    assert_eq!(radix_string(111u64, 3u64), "11010");
}

#[test]
fn radix_b3_n112() {
    assert_eq!(radix_string(112u64, 3u64), "11011");
}

#[test]
fn radix_b3_n113() {
    assert_eq!(radix_string(113u64, 3u64), "11012");
}

#[test]
fn radix_b3_n114() {
    assert_eq!(radix_string(114u64, 3u64), "11020");
}

#[test]
fn radix_b3_n115() {
    assert_eq!(radix_string(115u64, 3u64), "11021");
}

#[test]
fn radix_b3_n116() {
    assert_eq!(radix_string(116u64, 3u64), "11022");
}

#[test]
fn radix_b3_n117() {
    assert_eq!(radix_string(117u64, 3u64), "11100");
}

#[test]
fn radix_b3_n118() {
    assert_eq!(radix_string(118u64, 3u64), "11101");
}

#[test]
fn radix_b3_n119() {
    assert_eq!(radix_string(119u64, 3u64), "11102");
}

#[test]
fn radix_b4_n000() {
    assert_eq!(radix_string(0u64, 4u64), "0");
}

#[test]
fn radix_b4_n001() {
    assert_eq!(radix_string(1u64, 4u64), "1");
}

#[test]
fn radix_b4_n002() {
    assert_eq!(radix_string(2u64, 4u64), "2");
}

#[test]
fn radix_b4_n003() {
    assert_eq!(radix_string(3u64, 4u64), "3");
}

#[test]
fn radix_b4_n004() {
    assert_eq!(radix_string(4u64, 4u64), "10");
}

#[test]
fn radix_b4_n005() {
    assert_eq!(radix_string(5u64, 4u64), "11");
}

#[test]
fn radix_b4_n006() {
    assert_eq!(radix_string(6u64, 4u64), "12");
}

#[test]
fn radix_b4_n007() {
    assert_eq!(radix_string(7u64, 4u64), "13");
}

#[test]
fn radix_b4_n008() {
    assert_eq!(radix_string(8u64, 4u64), "20");
}

#[test]
fn radix_b4_n009() {
    assert_eq!(radix_string(9u64, 4u64), "21");
}

#[test]
fn radix_b4_n010() {
    assert_eq!(radix_string(10u64, 4u64), "22");
}

#[test]
fn radix_b4_n011() {
    assert_eq!(radix_string(11u64, 4u64), "23");
}

#[test]
fn radix_b4_n012() {
    assert_eq!(radix_string(12u64, 4u64), "30");
}

#[test]
fn radix_b4_n013() {
    assert_eq!(radix_string(13u64, 4u64), "31");
}

#[test]
fn radix_b4_n014() {
    assert_eq!(radix_string(14u64, 4u64), "32");
}

#[test]
fn radix_b4_n015() {
    assert_eq!(radix_string(15u64, 4u64), "33");
}

#[test]
fn radix_b4_n016() {
    assert_eq!(radix_string(16u64, 4u64), "100");
}

#[test]
fn radix_b4_n017() {
    assert_eq!(radix_string(17u64, 4u64), "101");
}

#[test]
fn radix_b4_n018() {
    assert_eq!(radix_string(18u64, 4u64), "102");
}

#[test]
fn radix_b4_n019() {
    assert_eq!(radix_string(19u64, 4u64), "103");
}

#[test]
fn radix_b4_n020() {
    assert_eq!(radix_string(20u64, 4u64), "110");
}

#[test]
fn radix_b4_n021() {
    assert_eq!(radix_string(21u64, 4u64), "111");
}

#[test]
fn radix_b4_n022() {
    assert_eq!(radix_string(22u64, 4u64), "112");
}

#[test]
fn radix_b4_n023() {
    assert_eq!(radix_string(23u64, 4u64), "113");
}

#[test]
fn radix_b4_n024() {
    assert_eq!(radix_string(24u64, 4u64), "120");
}

#[test]
fn radix_b4_n025() {
    assert_eq!(radix_string(25u64, 4u64), "121");
}

#[test]
fn radix_b4_n026() {
    assert_eq!(radix_string(26u64, 4u64), "122");
}

#[test]
fn radix_b4_n027() {
    assert_eq!(radix_string(27u64, 4u64), "123");
}

#[test]
fn radix_b4_n028() {
    assert_eq!(radix_string(28u64, 4u64), "130");
}

#[test]
fn radix_b4_n029() {
    assert_eq!(radix_string(29u64, 4u64), "131");
}

#[test]
fn radix_b4_n030() {
    assert_eq!(radix_string(30u64, 4u64), "132");
}

#[test]
fn radix_b4_n031() {
    assert_eq!(radix_string(31u64, 4u64), "133");
}

#[test]
fn radix_b4_n032() {
    assert_eq!(radix_string(32u64, 4u64), "200");
}

#[test]
fn radix_b4_n033() {
    assert_eq!(radix_string(33u64, 4u64), "201");
}

#[test]
fn radix_b4_n034() {
    assert_eq!(radix_string(34u64, 4u64), "202");
}

#[test]
fn radix_b4_n035() {
    assert_eq!(radix_string(35u64, 4u64), "203");
}

#[test]
fn radix_b4_n036() {
    assert_eq!(radix_string(36u64, 4u64), "210");
}

#[test]
fn radix_b4_n037() {
    assert_eq!(radix_string(37u64, 4u64), "211");
}

#[test]
fn radix_b4_n038() {
    assert_eq!(radix_string(38u64, 4u64), "212");
}

#[test]
fn radix_b4_n039() {
    assert_eq!(radix_string(39u64, 4u64), "213");
}

#[test]
fn radix_b4_n040() {
    assert_eq!(radix_string(40u64, 4u64), "220");
}

#[test]
fn radix_b4_n041() {
    assert_eq!(radix_string(41u64, 4u64), "221");
}

#[test]
fn radix_b4_n042() {
    assert_eq!(radix_string(42u64, 4u64), "222");
}

#[test]
fn radix_b4_n043() {
    assert_eq!(radix_string(43u64, 4u64), "223");
}

#[test]
fn radix_b4_n044() {
    assert_eq!(radix_string(44u64, 4u64), "230");
}

#[test]
fn radix_b4_n045() {
    assert_eq!(radix_string(45u64, 4u64), "231");
}

#[test]
fn radix_b4_n046() {
    assert_eq!(radix_string(46u64, 4u64), "232");
}

#[test]
fn radix_b4_n047() {
    assert_eq!(radix_string(47u64, 4u64), "233");
}

#[test]
fn radix_b4_n048() {
    assert_eq!(radix_string(48u64, 4u64), "300");
}

#[test]
fn radix_b4_n049() {
    assert_eq!(radix_string(49u64, 4u64), "301");
}

#[test]
fn radix_b4_n050() {
    assert_eq!(radix_string(50u64, 4u64), "302");
}

#[test]
fn radix_b4_n051() {
    assert_eq!(radix_string(51u64, 4u64), "303");
}

#[test]
fn radix_b4_n052() {
    assert_eq!(radix_string(52u64, 4u64), "310");
}

#[test]
fn radix_b4_n053() {
    assert_eq!(radix_string(53u64, 4u64), "311");
}

#[test]
fn radix_b4_n054() {
    assert_eq!(radix_string(54u64, 4u64), "312");
}

#[test]
fn radix_b4_n055() {
    assert_eq!(radix_string(55u64, 4u64), "313");
}

#[test]
fn radix_b4_n056() {
    assert_eq!(radix_string(56u64, 4u64), "320");
}

#[test]
fn radix_b4_n057() {
    assert_eq!(radix_string(57u64, 4u64), "321");
}

#[test]
fn radix_b4_n058() {
    assert_eq!(radix_string(58u64, 4u64), "322");
}

#[test]
fn radix_b4_n059() {
    assert_eq!(radix_string(59u64, 4u64), "323");
}

#[test]
fn radix_b4_n060() {
    assert_eq!(radix_string(60u64, 4u64), "330");
}

#[test]
fn radix_b4_n061() {
    assert_eq!(radix_string(61u64, 4u64), "331");
}

#[test]
fn radix_b4_n062() {
    assert_eq!(radix_string(62u64, 4u64), "332");
}

#[test]
fn radix_b4_n063() {
    assert_eq!(radix_string(63u64, 4u64), "333");
}

#[test]
fn radix_b4_n064() {
    assert_eq!(radix_string(64u64, 4u64), "1000");
}

#[test]
fn radix_b4_n065() {
    assert_eq!(radix_string(65u64, 4u64), "1001");
}

#[test]
fn radix_b4_n066() {
    assert_eq!(radix_string(66u64, 4u64), "1002");
}

#[test]
fn radix_b4_n067() {
    assert_eq!(radix_string(67u64, 4u64), "1003");
}

#[test]
fn radix_b4_n068() {
    assert_eq!(radix_string(68u64, 4u64), "1010");
}

#[test]
fn radix_b4_n069() {
    assert_eq!(radix_string(69u64, 4u64), "1011");
}

#[test]
fn radix_b4_n070() {
    assert_eq!(radix_string(70u64, 4u64), "1012");
}

#[test]
fn radix_b4_n071() {
    assert_eq!(radix_string(71u64, 4u64), "1013");
}

#[test]
fn radix_b4_n072() {
    assert_eq!(radix_string(72u64, 4u64), "1020");
}

#[test]
fn radix_b4_n073() {
    assert_eq!(radix_string(73u64, 4u64), "1021");
}

#[test]
fn radix_b4_n074() {
    assert_eq!(radix_string(74u64, 4u64), "1022");
}

#[test]
fn radix_b4_n075() {
    assert_eq!(radix_string(75u64, 4u64), "1023");
}

#[test]
fn radix_b4_n076() {
    assert_eq!(radix_string(76u64, 4u64), "1030");
}

#[test]
fn radix_b4_n077() {
    assert_eq!(radix_string(77u64, 4u64), "1031");
}

#[test]
fn radix_b4_n078() {
    assert_eq!(radix_string(78u64, 4u64), "1032");
}

#[test]
fn radix_b4_n079() {
    assert_eq!(radix_string(79u64, 4u64), "1033");
}

#[test]
fn radix_b4_n080() {
    assert_eq!(radix_string(80u64, 4u64), "1100");
}

#[test]
fn radix_b4_n081() {
    assert_eq!(radix_string(81u64, 4u64), "1101");
}

#[test]
fn radix_b4_n082() {
    assert_eq!(radix_string(82u64, 4u64), "1102");
}

#[test]
fn radix_b4_n083() {
    assert_eq!(radix_string(83u64, 4u64), "1103");
}

#[test]
fn radix_b4_n084() {
    assert_eq!(radix_string(84u64, 4u64), "1110");
}

#[test]
fn radix_b4_n085() {
    assert_eq!(radix_string(85u64, 4u64), "1111");
}

#[test]
fn radix_b4_n086() {
    assert_eq!(radix_string(86u64, 4u64), "1112");
}

#[test]
fn radix_b4_n087() {
    assert_eq!(radix_string(87u64, 4u64), "1113");
}

#[test]
fn radix_b4_n088() {
    assert_eq!(radix_string(88u64, 4u64), "1120");
}

#[test]
fn radix_b4_n089() {
    assert_eq!(radix_string(89u64, 4u64), "1121");
}

#[test]
fn radix_b4_n090() {
    assert_eq!(radix_string(90u64, 4u64), "1122");
}

#[test]
fn radix_b4_n091() {
    assert_eq!(radix_string(91u64, 4u64), "1123");
}

#[test]
fn radix_b4_n092() {
    assert_eq!(radix_string(92u64, 4u64), "1130");
}

#[test]
fn radix_b4_n093() {
    assert_eq!(radix_string(93u64, 4u64), "1131");
}

#[test]
fn radix_b4_n094() {
    assert_eq!(radix_string(94u64, 4u64), "1132");
}

#[test]
fn radix_b4_n095() {
    assert_eq!(radix_string(95u64, 4u64), "1133");
}

#[test]
fn radix_b4_n096() {
    assert_eq!(radix_string(96u64, 4u64), "1200");
}

#[test]
fn radix_b4_n097() {
    assert_eq!(radix_string(97u64, 4u64), "1201");
}

#[test]
fn radix_b4_n098() {
    assert_eq!(radix_string(98u64, 4u64), "1202");
}

#[test]
fn radix_b4_n099() {
    assert_eq!(radix_string(99u64, 4u64), "1203");
}

#[test]
fn radix_b4_n100() {
    assert_eq!(radix_string(100u64, 4u64), "1210");
}

#[test]
fn radix_b4_n101() {
    assert_eq!(radix_string(101u64, 4u64), "1211");
}

#[test]
fn radix_b4_n102() {
    assert_eq!(radix_string(102u64, 4u64), "1212");
}

#[test]
fn radix_b4_n103() {
    assert_eq!(radix_string(103u64, 4u64), "1213");
}

#[test]
fn radix_b4_n104() {
    assert_eq!(radix_string(104u64, 4u64), "1220");
}

#[test]
fn radix_b4_n105() {
    assert_eq!(radix_string(105u64, 4u64), "1221");
}

#[test]
fn radix_b4_n106() {
    assert_eq!(radix_string(106u64, 4u64), "1222");
}

#[test]
fn radix_b4_n107() {
    assert_eq!(radix_string(107u64, 4u64), "1223");
}

#[test]
fn radix_b4_n108() {
    assert_eq!(radix_string(108u64, 4u64), "1230");
}

#[test]
fn radix_b4_n109() {
    assert_eq!(radix_string(109u64, 4u64), "1231");
}

#[test]
fn radix_b4_n110() {
    assert_eq!(radix_string(110u64, 4u64), "1232");
}

#[test]
fn radix_b4_n111() {
    assert_eq!(radix_string(111u64, 4u64), "1233");
}

#[test]
fn radix_b4_n112() {
    assert_eq!(radix_string(112u64, 4u64), "1300");
}

#[test]
fn radix_b4_n113() {
    assert_eq!(radix_string(113u64, 4u64), "1301");
}

#[test]
fn radix_b4_n114() {
    assert_eq!(radix_string(114u64, 4u64), "1302");
}

#[test]
fn radix_b4_n115() {
    assert_eq!(radix_string(115u64, 4u64), "1303");
}

#[test]
fn radix_b4_n116() {
    assert_eq!(radix_string(116u64, 4u64), "1310");
}

#[test]
fn radix_b4_n117() {
    assert_eq!(radix_string(117u64, 4u64), "1311");
}

#[test]
fn radix_b4_n118() {
    assert_eq!(radix_string(118u64, 4u64), "1312");
}

#[test]
fn radix_b4_n119() {
    assert_eq!(radix_string(119u64, 4u64), "1313");
}

#[test]
fn radix_b8_n000() {
    assert_eq!(radix_string(0u64, 8u64), "0");
}

#[test]
fn radix_b8_n001() {
    assert_eq!(radix_string(1u64, 8u64), "1");
}

#[test]
fn radix_b8_n002() {
    assert_eq!(radix_string(2u64, 8u64), "2");
}

#[test]
fn radix_b8_n003() {
    assert_eq!(radix_string(3u64, 8u64), "3");
}

#[test]
fn radix_b8_n004() {
    assert_eq!(radix_string(4u64, 8u64), "4");
}

#[test]
fn radix_b8_n005() {
    assert_eq!(radix_string(5u64, 8u64), "5");
}

#[test]
fn radix_b8_n006() {
    assert_eq!(radix_string(6u64, 8u64), "6");
}

#[test]
fn radix_b8_n007() {
    assert_eq!(radix_string(7u64, 8u64), "7");
}

#[test]
fn radix_b8_n008() {
    assert_eq!(radix_string(8u64, 8u64), "10");
}

#[test]
fn radix_b8_n009() {
    assert_eq!(radix_string(9u64, 8u64), "11");
}

#[test]
fn radix_b8_n010() {
    assert_eq!(radix_string(10u64, 8u64), "12");
}

#[test]
fn radix_b8_n011() {
    assert_eq!(radix_string(11u64, 8u64), "13");
}

#[test]
fn radix_b8_n012() {
    assert_eq!(radix_string(12u64, 8u64), "14");
}

#[test]
fn radix_b8_n013() {
    assert_eq!(radix_string(13u64, 8u64), "15");
}

#[test]
fn radix_b8_n014() {
    assert_eq!(radix_string(14u64, 8u64), "16");
}

#[test]
fn radix_b8_n015() {
    assert_eq!(radix_string(15u64, 8u64), "17");
}

#[test]
fn radix_b8_n016() {
    assert_eq!(radix_string(16u64, 8u64), "20");
}

#[test]
fn radix_b8_n017() {
    assert_eq!(radix_string(17u64, 8u64), "21");
}

#[test]
fn radix_b8_n018() {
    assert_eq!(radix_string(18u64, 8u64), "22");
}

#[test]
fn radix_b8_n019() {
    assert_eq!(radix_string(19u64, 8u64), "23");
}

#[test]
fn radix_b8_n020() {
    assert_eq!(radix_string(20u64, 8u64), "24");
}

#[test]
fn radix_b8_n021() {
    assert_eq!(radix_string(21u64, 8u64), "25");
}

#[test]
fn radix_b8_n022() {
    assert_eq!(radix_string(22u64, 8u64), "26");
}

#[test]
fn radix_b8_n023() {
    assert_eq!(radix_string(23u64, 8u64), "27");
}

#[test]
fn radix_b8_n024() {
    assert_eq!(radix_string(24u64, 8u64), "30");
}

#[test]
fn radix_b8_n025() {
    assert_eq!(radix_string(25u64, 8u64), "31");
}

#[test]
fn radix_b8_n026() {
    assert_eq!(radix_string(26u64, 8u64), "32");
}

#[test]
fn radix_b8_n027() {
    assert_eq!(radix_string(27u64, 8u64), "33");
}

#[test]
fn radix_b8_n028() {
    assert_eq!(radix_string(28u64, 8u64), "34");
}

#[test]
fn radix_b8_n029() {
    assert_eq!(radix_string(29u64, 8u64), "35");
}

#[test]
fn radix_b8_n030() {
    assert_eq!(radix_string(30u64, 8u64), "36");
}

#[test]
fn radix_b8_n031() {
    assert_eq!(radix_string(31u64, 8u64), "37");
}

#[test]
fn radix_b8_n032() {
    assert_eq!(radix_string(32u64, 8u64), "40");
}

#[test]
fn radix_b8_n033() {
    assert_eq!(radix_string(33u64, 8u64), "41");
}

#[test]
fn radix_b8_n034() {
    assert_eq!(radix_string(34u64, 8u64), "42");
}

#[test]
fn radix_b8_n035() {
    assert_eq!(radix_string(35u64, 8u64), "43");
}

#[test]
fn radix_b8_n036() {
    assert_eq!(radix_string(36u64, 8u64), "44");
}

#[test]
fn radix_b8_n037() {
    assert_eq!(radix_string(37u64, 8u64), "45");
}

#[test]
fn radix_b8_n038() {
    assert_eq!(radix_string(38u64, 8u64), "46");
}

#[test]
fn radix_b8_n039() {
    assert_eq!(radix_string(39u64, 8u64), "47");
}

#[test]
fn radix_b8_n040() {
    assert_eq!(radix_string(40u64, 8u64), "50");
}

#[test]
fn radix_b8_n041() {
    assert_eq!(radix_string(41u64, 8u64), "51");
}

#[test]
fn radix_b8_n042() {
    assert_eq!(radix_string(42u64, 8u64), "52");
}

#[test]
fn radix_b8_n043() {
    assert_eq!(radix_string(43u64, 8u64), "53");
}

#[test]
fn radix_b8_n044() {
    assert_eq!(radix_string(44u64, 8u64), "54");
}

#[test]
fn radix_b8_n045() {
    assert_eq!(radix_string(45u64, 8u64), "55");
}

#[test]
fn radix_b8_n046() {
    assert_eq!(radix_string(46u64, 8u64), "56");
}

#[test]
fn radix_b8_n047() {
    assert_eq!(radix_string(47u64, 8u64), "57");
}

#[test]
fn radix_b8_n048() {
    assert_eq!(radix_string(48u64, 8u64), "60");
}

#[test]
fn radix_b8_n049() {
    assert_eq!(radix_string(49u64, 8u64), "61");
}

#[test]
fn radix_b8_n050() {
    assert_eq!(radix_string(50u64, 8u64), "62");
}

#[test]
fn radix_b8_n051() {
    assert_eq!(radix_string(51u64, 8u64), "63");
}

#[test]
fn radix_b8_n052() {
    assert_eq!(radix_string(52u64, 8u64), "64");
}

#[test]
fn radix_b8_n053() {
    assert_eq!(radix_string(53u64, 8u64), "65");
}

#[test]
fn radix_b8_n054() {
    assert_eq!(radix_string(54u64, 8u64), "66");
}

#[test]
fn radix_b8_n055() {
    assert_eq!(radix_string(55u64, 8u64), "67");
}

#[test]
fn radix_b8_n056() {
    assert_eq!(radix_string(56u64, 8u64), "70");
}

#[test]
fn radix_b8_n057() {
    assert_eq!(radix_string(57u64, 8u64), "71");
}

#[test]
fn radix_b8_n058() {
    assert_eq!(radix_string(58u64, 8u64), "72");
}

#[test]
fn radix_b8_n059() {
    assert_eq!(radix_string(59u64, 8u64), "73");
}

#[test]
fn radix_b8_n060() {
    assert_eq!(radix_string(60u64, 8u64), "74");
}

#[test]
fn radix_b8_n061() {
    assert_eq!(radix_string(61u64, 8u64), "75");
}

#[test]
fn radix_b8_n062() {
    assert_eq!(radix_string(62u64, 8u64), "76");
}

#[test]
fn radix_b8_n063() {
    assert_eq!(radix_string(63u64, 8u64), "77");
}

#[test]
fn radix_b8_n064() {
    assert_eq!(radix_string(64u64, 8u64), "100");
}

#[test]
fn radix_b8_n065() {
    assert_eq!(radix_string(65u64, 8u64), "101");
}

#[test]
fn radix_b8_n066() {
    assert_eq!(radix_string(66u64, 8u64), "102");
}

#[test]
fn radix_b8_n067() {
    assert_eq!(radix_string(67u64, 8u64), "103");
}

#[test]
fn radix_b8_n068() {
    assert_eq!(radix_string(68u64, 8u64), "104");
}

#[test]
fn radix_b8_n069() {
    assert_eq!(radix_string(69u64, 8u64), "105");
}

#[test]
fn radix_b8_n070() {
    assert_eq!(radix_string(70u64, 8u64), "106");
}

#[test]
fn radix_b8_n071() {
    assert_eq!(radix_string(71u64, 8u64), "107");
}

#[test]
fn radix_b8_n072() {
    assert_eq!(radix_string(72u64, 8u64), "110");
}

#[test]
fn radix_b8_n073() {
    assert_eq!(radix_string(73u64, 8u64), "111");
}

#[test]
fn radix_b8_n074() {
    assert_eq!(radix_string(74u64, 8u64), "112");
}

#[test]
fn radix_b8_n075() {
    assert_eq!(radix_string(75u64, 8u64), "113");
}

#[test]
fn radix_b8_n076() {
    assert_eq!(radix_string(76u64, 8u64), "114");
}

#[test]
fn radix_b8_n077() {
    assert_eq!(radix_string(77u64, 8u64), "115");
}

#[test]
fn radix_b8_n078() {
    assert_eq!(radix_string(78u64, 8u64), "116");
}

#[test]
fn radix_b8_n079() {
    assert_eq!(radix_string(79u64, 8u64), "117");
}

#[test]
fn radix_b8_n080() {
    assert_eq!(radix_string(80u64, 8u64), "120");
}

#[test]
fn radix_b8_n081() {
    assert_eq!(radix_string(81u64, 8u64), "121");
}

#[test]
fn radix_b8_n082() {
    assert_eq!(radix_string(82u64, 8u64), "122");
}

#[test]
fn radix_b8_n083() {
    assert_eq!(radix_string(83u64, 8u64), "123");
}

#[test]
fn radix_b8_n084() {
    assert_eq!(radix_string(84u64, 8u64), "124");
}

#[test]
fn radix_b8_n085() {
    assert_eq!(radix_string(85u64, 8u64), "125");
}

#[test]
fn radix_b8_n086() {
    assert_eq!(radix_string(86u64, 8u64), "126");
}

#[test]
fn radix_b8_n087() {
    assert_eq!(radix_string(87u64, 8u64), "127");
}

#[test]
fn radix_b8_n088() {
    assert_eq!(radix_string(88u64, 8u64), "130");
}

#[test]
fn radix_b8_n089() {
    assert_eq!(radix_string(89u64, 8u64), "131");
}

#[test]
fn radix_b8_n090() {
    assert_eq!(radix_string(90u64, 8u64), "132");
}

#[test]
fn radix_b8_n091() {
    assert_eq!(radix_string(91u64, 8u64), "133");
}

#[test]
fn radix_b8_n092() {
    assert_eq!(radix_string(92u64, 8u64), "134");
}

#[test]
fn radix_b8_n093() {
    assert_eq!(radix_string(93u64, 8u64), "135");
}

#[test]
fn radix_b8_n094() {
    assert_eq!(radix_string(94u64, 8u64), "136");
}

#[test]
fn radix_b8_n095() {
    assert_eq!(radix_string(95u64, 8u64), "137");
}

#[test]
fn radix_b8_n096() {
    assert_eq!(radix_string(96u64, 8u64), "140");
}

#[test]
fn radix_b8_n097() {
    assert_eq!(radix_string(97u64, 8u64), "141");
}

#[test]
fn radix_b8_n098() {
    assert_eq!(radix_string(98u64, 8u64), "142");
}

#[test]
fn radix_b8_n099() {
    assert_eq!(radix_string(99u64, 8u64), "143");
}

#[test]
fn radix_b8_n100() {
    assert_eq!(radix_string(100u64, 8u64), "144");
}

#[test]
fn radix_b8_n101() {
    assert_eq!(radix_string(101u64, 8u64), "145");
}

#[test]
fn radix_b8_n102() {
    assert_eq!(radix_string(102u64, 8u64), "146");
}

#[test]
fn radix_b8_n103() {
    assert_eq!(radix_string(103u64, 8u64), "147");
}

#[test]
fn radix_b8_n104() {
    assert_eq!(radix_string(104u64, 8u64), "150");
}

#[test]
fn radix_b8_n105() {
    assert_eq!(radix_string(105u64, 8u64), "151");
}

#[test]
fn radix_b8_n106() {
    assert_eq!(radix_string(106u64, 8u64), "152");
}

#[test]
fn radix_b8_n107() {
    assert_eq!(radix_string(107u64, 8u64), "153");
}

#[test]
fn radix_b8_n108() {
    assert_eq!(radix_string(108u64, 8u64), "154");
}

#[test]
fn radix_b8_n109() {
    assert_eq!(radix_string(109u64, 8u64), "155");
}

#[test]
fn radix_b8_n110() {
    assert_eq!(radix_string(110u64, 8u64), "156");
}

#[test]
fn radix_b8_n111() {
    assert_eq!(radix_string(111u64, 8u64), "157");
}

#[test]
fn radix_b8_n112() {
    assert_eq!(radix_string(112u64, 8u64), "160");
}

#[test]
fn radix_b8_n113() {
    assert_eq!(radix_string(113u64, 8u64), "161");
}

#[test]
fn radix_b8_n114() {
    assert_eq!(radix_string(114u64, 8u64), "162");
}

#[test]
fn radix_b8_n115() {
    assert_eq!(radix_string(115u64, 8u64), "163");
}

#[test]
fn radix_b8_n116() {
    assert_eq!(radix_string(116u64, 8u64), "164");
}

#[test]
fn radix_b8_n117() {
    assert_eq!(radix_string(117u64, 8u64), "165");
}

#[test]
fn radix_b8_n118() {
    assert_eq!(radix_string(118u64, 8u64), "166");
}

#[test]
fn radix_b8_n119() {
    assert_eq!(radix_string(119u64, 8u64), "167");
}

#[test]
fn radix_b10_n000() {
    assert_eq!(radix_string(0u64, 10u64), "0");
}

#[test]
fn radix_b10_n001() {
    assert_eq!(radix_string(1u64, 10u64), "1");
}

#[test]
fn radix_b10_n002() {
    assert_eq!(radix_string(2u64, 10u64), "2");
}

#[test]
fn radix_b10_n003() {
    assert_eq!(radix_string(3u64, 10u64), "3");
}

#[test]
fn radix_b10_n004() {
    assert_eq!(radix_string(4u64, 10u64), "4");
}

#[test]
fn radix_b10_n005() {
    assert_eq!(radix_string(5u64, 10u64), "5");
}

#[test]
fn radix_b10_n006() {
    assert_eq!(radix_string(6u64, 10u64), "6");
}

#[test]
fn radix_b10_n007() {
    assert_eq!(radix_string(7u64, 10u64), "7");
}

#[test]
fn radix_b10_n008() {
    assert_eq!(radix_string(8u64, 10u64), "8");
}

#[test]
fn radix_b10_n009() {
    assert_eq!(radix_string(9u64, 10u64), "9");
}

#[test]
fn radix_b10_n010() {
    assert_eq!(radix_string(10u64, 10u64), "10");
}

#[test]
fn radix_b10_n011() {
    assert_eq!(radix_string(11u64, 10u64), "11");
}

#[test]
fn radix_b10_n012() {
    assert_eq!(radix_string(12u64, 10u64), "12");
}

#[test]
fn radix_b10_n013() {
    assert_eq!(radix_string(13u64, 10u64), "13");
}

#[test]
fn radix_b10_n014() {
    assert_eq!(radix_string(14u64, 10u64), "14");
}

#[test]
fn radix_b10_n015() {
    assert_eq!(radix_string(15u64, 10u64), "15");
}

#[test]
fn radix_b10_n016() {
    assert_eq!(radix_string(16u64, 10u64), "16");
}

#[test]
fn radix_b10_n017() {
    assert_eq!(radix_string(17u64, 10u64), "17");
}

#[test]
fn radix_b10_n018() {
    assert_eq!(radix_string(18u64, 10u64), "18");
}

#[test]
fn radix_b10_n019() {
    assert_eq!(radix_string(19u64, 10u64), "19");
}

#[test]
fn radix_b10_n020() {
    assert_eq!(radix_string(20u64, 10u64), "20");
}

#[test]
fn radix_b10_n021() {
    assert_eq!(radix_string(21u64, 10u64), "21");
}

#[test]
fn radix_b10_n022() {
    assert_eq!(radix_string(22u64, 10u64), "22");
}

#[test]
fn radix_b10_n023() {
    assert_eq!(radix_string(23u64, 10u64), "23");
}

#[test]
fn radix_b10_n024() {
    assert_eq!(radix_string(24u64, 10u64), "24");
}

#[test]
fn radix_b10_n025() {
    assert_eq!(radix_string(25u64, 10u64), "25");
}

#[test]
fn radix_b10_n026() {
    assert_eq!(radix_string(26u64, 10u64), "26");
}

#[test]
fn radix_b10_n027() {
    assert_eq!(radix_string(27u64, 10u64), "27");
}

#[test]
fn radix_b10_n028() {
    assert_eq!(radix_string(28u64, 10u64), "28");
}

#[test]
fn radix_b10_n029() {
    assert_eq!(radix_string(29u64, 10u64), "29");
}

#[test]
fn radix_b10_n030() {
    assert_eq!(radix_string(30u64, 10u64), "30");
}

#[test]
fn radix_b10_n031() {
    assert_eq!(radix_string(31u64, 10u64), "31");
}

#[test]
fn radix_b10_n032() {
    assert_eq!(radix_string(32u64, 10u64), "32");
}

#[test]
fn radix_b10_n033() {
    assert_eq!(radix_string(33u64, 10u64), "33");
}

#[test]
fn radix_b10_n034() {
    assert_eq!(radix_string(34u64, 10u64), "34");
}

#[test]
fn radix_b10_n035() {
    assert_eq!(radix_string(35u64, 10u64), "35");
}

#[test]
fn radix_b10_n036() {
    assert_eq!(radix_string(36u64, 10u64), "36");
}

#[test]
fn radix_b10_n037() {
    assert_eq!(radix_string(37u64, 10u64), "37");
}

#[test]
fn radix_b10_n038() {
    assert_eq!(radix_string(38u64, 10u64), "38");
}

#[test]
fn radix_b10_n039() {
    assert_eq!(radix_string(39u64, 10u64), "39");
}

#[test]
fn radix_b10_n040() {
    assert_eq!(radix_string(40u64, 10u64), "40");
}

#[test]
fn radix_b10_n041() {
    assert_eq!(radix_string(41u64, 10u64), "41");
}

#[test]
fn radix_b10_n042() {
    assert_eq!(radix_string(42u64, 10u64), "42");
}

#[test]
fn radix_b10_n043() {
    assert_eq!(radix_string(43u64, 10u64), "43");
}

#[test]
fn radix_b10_n044() {
    assert_eq!(radix_string(44u64, 10u64), "44");
}

#[test]
fn radix_b10_n045() {
    assert_eq!(radix_string(45u64, 10u64), "45");
}

#[test]
fn radix_b10_n046() {
    assert_eq!(radix_string(46u64, 10u64), "46");
}

#[test]
fn radix_b10_n047() {
    assert_eq!(radix_string(47u64, 10u64), "47");
}

#[test]
fn radix_b10_n048() {
    assert_eq!(radix_string(48u64, 10u64), "48");
}

#[test]
fn radix_b10_n049() {
    assert_eq!(radix_string(49u64, 10u64), "49");
}

#[test]
fn radix_b10_n050() {
    assert_eq!(radix_string(50u64, 10u64), "50");
}

#[test]
fn radix_b10_n051() {
    assert_eq!(radix_string(51u64, 10u64), "51");
}

#[test]
fn radix_b10_n052() {
    assert_eq!(radix_string(52u64, 10u64), "52");
}

#[test]
fn radix_b10_n053() {
    assert_eq!(radix_string(53u64, 10u64), "53");
}

#[test]
fn radix_b10_n054() {
    assert_eq!(radix_string(54u64, 10u64), "54");
}

#[test]
fn radix_b10_n055() {
    assert_eq!(radix_string(55u64, 10u64), "55");
}

#[test]
fn radix_b10_n056() {
    assert_eq!(radix_string(56u64, 10u64), "56");
}

#[test]
fn radix_b10_n057() {
    assert_eq!(radix_string(57u64, 10u64), "57");
}

#[test]
fn radix_b10_n058() {
    assert_eq!(radix_string(58u64, 10u64), "58");
}

#[test]
fn radix_b10_n059() {
    assert_eq!(radix_string(59u64, 10u64), "59");
}

#[test]
fn radix_b10_n060() {
    assert_eq!(radix_string(60u64, 10u64), "60");
}

#[test]
fn radix_b10_n061() {
    assert_eq!(radix_string(61u64, 10u64), "61");
}

#[test]
fn radix_b10_n062() {
    assert_eq!(radix_string(62u64, 10u64), "62");
}

#[test]
fn radix_b10_n063() {
    assert_eq!(radix_string(63u64, 10u64), "63");
}

#[test]
fn radix_b10_n064() {
    assert_eq!(radix_string(64u64, 10u64), "64");
}

#[test]
fn radix_b10_n065() {
    assert_eq!(radix_string(65u64, 10u64), "65");
}

#[test]
fn radix_b10_n066() {
    assert_eq!(radix_string(66u64, 10u64), "66");
}

#[test]
fn radix_b10_n067() {
    assert_eq!(radix_string(67u64, 10u64), "67");
}

#[test]
fn radix_b10_n068() {
    assert_eq!(radix_string(68u64, 10u64), "68");
}

#[test]
fn radix_b10_n069() {
    assert_eq!(radix_string(69u64, 10u64), "69");
}

#[test]
fn radix_b10_n070() {
    assert_eq!(radix_string(70u64, 10u64), "70");
}

#[test]
fn radix_b10_n071() {
    assert_eq!(radix_string(71u64, 10u64), "71");
}

#[test]
fn radix_b10_n072() {
    assert_eq!(radix_string(72u64, 10u64), "72");
}

#[test]
fn radix_b10_n073() {
    assert_eq!(radix_string(73u64, 10u64), "73");
}

#[test]
fn radix_b10_n074() {
    assert_eq!(radix_string(74u64, 10u64), "74");
}

#[test]
fn radix_b10_n075() {
    assert_eq!(radix_string(75u64, 10u64), "75");
}

#[test]
fn radix_b10_n076() {
    assert_eq!(radix_string(76u64, 10u64), "76");
}

#[test]
fn radix_b10_n077() {
    assert_eq!(radix_string(77u64, 10u64), "77");
}

#[test]
fn radix_b10_n078() {
    assert_eq!(radix_string(78u64, 10u64), "78");
}

#[test]
fn radix_b10_n079() {
    assert_eq!(radix_string(79u64, 10u64), "79");
}

#[test]
fn radix_b10_n080() {
    assert_eq!(radix_string(80u64, 10u64), "80");
}

#[test]
fn radix_b10_n081() {
    assert_eq!(radix_string(81u64, 10u64), "81");
}

#[test]
fn radix_b10_n082() {
    assert_eq!(radix_string(82u64, 10u64), "82");
}

#[test]
fn radix_b10_n083() {
    assert_eq!(radix_string(83u64, 10u64), "83");
}

#[test]
fn radix_b10_n084() {
    assert_eq!(radix_string(84u64, 10u64), "84");
}

#[test]
fn radix_b10_n085() {
    assert_eq!(radix_string(85u64, 10u64), "85");
}

#[test]
fn radix_b10_n086() {
    assert_eq!(radix_string(86u64, 10u64), "86");
}

#[test]
fn radix_b10_n087() {
    assert_eq!(radix_string(87u64, 10u64), "87");
}

#[test]
fn radix_b10_n088() {
    assert_eq!(radix_string(88u64, 10u64), "88");
}

#[test]
fn radix_b10_n089() {
    assert_eq!(radix_string(89u64, 10u64), "89");
}

#[test]
fn radix_b10_n090() {
    assert_eq!(radix_string(90u64, 10u64), "90");
}

#[test]
fn radix_b10_n091() {
    assert_eq!(radix_string(91u64, 10u64), "91");
}

#[test]
fn radix_b10_n092() {
    assert_eq!(radix_string(92u64, 10u64), "92");
}

#[test]
fn radix_b10_n093() {
    assert_eq!(radix_string(93u64, 10u64), "93");
}

#[test]
fn radix_b10_n094() {
    assert_eq!(radix_string(94u64, 10u64), "94");
}

#[test]
fn radix_b10_n095() {
    assert_eq!(radix_string(95u64, 10u64), "95");
}

#[test]
fn radix_b10_n096() {
    assert_eq!(radix_string(96u64, 10u64), "96");
}

#[test]
fn radix_b10_n097() {
    assert_eq!(radix_string(97u64, 10u64), "97");
}

#[test]
fn radix_b10_n098() {
    assert_eq!(radix_string(98u64, 10u64), "98");
}

#[test]
fn radix_b10_n099() {
    assert_eq!(radix_string(99u64, 10u64), "99");
}

#[test]
fn radix_b10_n100() {
    assert_eq!(radix_string(100u64, 10u64), "100");
}

#[test]
fn radix_b10_n101() {
    assert_eq!(radix_string(101u64, 10u64), "101");
}

#[test]
fn radix_b10_n102() {
    assert_eq!(radix_string(102u64, 10u64), "102");
}

#[test]
fn radix_b10_n103() {
    assert_eq!(radix_string(103u64, 10u64), "103");
}

#[test]
fn radix_b10_n104() {
    assert_eq!(radix_string(104u64, 10u64), "104");
}

#[test]
fn radix_b10_n105() {
    assert_eq!(radix_string(105u64, 10u64), "105");
}

#[test]
fn radix_b10_n106() {
    assert_eq!(radix_string(106u64, 10u64), "106");
}

#[test]
fn radix_b10_n107() {
    assert_eq!(radix_string(107u64, 10u64), "107");
}

#[test]
fn radix_b10_n108() {
    assert_eq!(radix_string(108u64, 10u64), "108");
}

#[test]
fn radix_b10_n109() {
    assert_eq!(radix_string(109u64, 10u64), "109");
}

#[test]
fn radix_b10_n110() {
    assert_eq!(radix_string(110u64, 10u64), "110");
}

#[test]
fn radix_b10_n111() {
    assert_eq!(radix_string(111u64, 10u64), "111");
}

#[test]
fn radix_b10_n112() {
    assert_eq!(radix_string(112u64, 10u64), "112");
}

#[test]
fn radix_b10_n113() {
    assert_eq!(radix_string(113u64, 10u64), "113");
}

#[test]
fn radix_b10_n114() {
    assert_eq!(radix_string(114u64, 10u64), "114");
}

#[test]
fn radix_b10_n115() {
    assert_eq!(radix_string(115u64, 10u64), "115");
}

#[test]
fn radix_b10_n116() {
    assert_eq!(radix_string(116u64, 10u64), "116");
}

#[test]
fn radix_b10_n117() {
    assert_eq!(radix_string(117u64, 10u64), "117");
}

#[test]
fn radix_b10_n118() {
    assert_eq!(radix_string(118u64, 10u64), "118");
}

#[test]
fn radix_b10_n119() {
    assert_eq!(radix_string(119u64, 10u64), "119");
}

#[test]
fn radix_b12_n000() {
    assert_eq!(radix_string(0u64, 12u64), "0");
}

#[test]
fn radix_b12_n001() {
    assert_eq!(radix_string(1u64, 12u64), "1");
}

#[test]
fn radix_b12_n002() {
    assert_eq!(radix_string(2u64, 12u64), "2");
}

#[test]
fn radix_b12_n003() {
    assert_eq!(radix_string(3u64, 12u64), "3");
}

#[test]
fn radix_b12_n004() {
    assert_eq!(radix_string(4u64, 12u64), "4");
}

#[test]
fn radix_b12_n005() {
    assert_eq!(radix_string(5u64, 12u64), "5");
}

#[test]
fn radix_b12_n006() {
    assert_eq!(radix_string(6u64, 12u64), "6");
}

#[test]
fn radix_b12_n007() {
    assert_eq!(radix_string(7u64, 12u64), "7");
}

#[test]
fn radix_b12_n008() {
    assert_eq!(radix_string(8u64, 12u64), "8");
}

#[test]
fn radix_b12_n009() {
    assert_eq!(radix_string(9u64, 12u64), "9");
}

#[test]
fn radix_b12_n010() {
    assert_eq!(radix_string(10u64, 12u64), "a");
}

#[test]
fn radix_b12_n011() {
    assert_eq!(radix_string(11u64, 12u64), "b");
}

#[test]
fn radix_b12_n012() {
    assert_eq!(radix_string(12u64, 12u64), "10");
}

#[test]
fn radix_b12_n013() {
    assert_eq!(radix_string(13u64, 12u64), "11");
}

#[test]
fn radix_b12_n014() {
    assert_eq!(radix_string(14u64, 12u64), "12");
}

#[test]
fn radix_b12_n015() {
    assert_eq!(radix_string(15u64, 12u64), "13");
}

#[test]
fn radix_b12_n016() {
    assert_eq!(radix_string(16u64, 12u64), "14");
}

#[test]
fn radix_b12_n017() {
    assert_eq!(radix_string(17u64, 12u64), "15");
}

#[test]
fn radix_b12_n018() {
    assert_eq!(radix_string(18u64, 12u64), "16");
}

#[test]
fn radix_b12_n019() {
    assert_eq!(radix_string(19u64, 12u64), "17");
}

#[test]
fn radix_b12_n020() {
    assert_eq!(radix_string(20u64, 12u64), "18");
}

#[test]
fn radix_b12_n021() {
    assert_eq!(radix_string(21u64, 12u64), "19");
}

#[test]
fn radix_b12_n022() {
    assert_eq!(radix_string(22u64, 12u64), "1a");
}

#[test]
fn radix_b12_n023() {
    assert_eq!(radix_string(23u64, 12u64), "1b");
}

#[test]
fn radix_b12_n024() {
    assert_eq!(radix_string(24u64, 12u64), "20");
}

#[test]
fn radix_b12_n025() {
    assert_eq!(radix_string(25u64, 12u64), "21");
}

#[test]
fn radix_b12_n026() {
    assert_eq!(radix_string(26u64, 12u64), "22");
}

#[test]
fn radix_b12_n027() {
    assert_eq!(radix_string(27u64, 12u64), "23");
}

#[test]
fn radix_b12_n028() {
    assert_eq!(radix_string(28u64, 12u64), "24");
}

#[test]
fn radix_b12_n029() {
    assert_eq!(radix_string(29u64, 12u64), "25");
}

#[test]
fn radix_b12_n030() {
    assert_eq!(radix_string(30u64, 12u64), "26");
}

#[test]
fn radix_b12_n031() {
    assert_eq!(radix_string(31u64, 12u64), "27");
}

#[test]
fn radix_b12_n032() {
    assert_eq!(radix_string(32u64, 12u64), "28");
}

#[test]
fn radix_b12_n033() {
    assert_eq!(radix_string(33u64, 12u64), "29");
}

#[test]
fn radix_b12_n034() {
    assert_eq!(radix_string(34u64, 12u64), "2a");
}

#[test]
fn radix_b12_n035() {
    assert_eq!(radix_string(35u64, 12u64), "2b");
}

#[test]
fn radix_b12_n036() {
    assert_eq!(radix_string(36u64, 12u64), "30");
}

#[test]
fn radix_b12_n037() {
    assert_eq!(radix_string(37u64, 12u64), "31");
}

#[test]
fn radix_b12_n038() {
    assert_eq!(radix_string(38u64, 12u64), "32");
}

#[test]
fn radix_b12_n039() {
    assert_eq!(radix_string(39u64, 12u64), "33");
}

#[test]
fn radix_b12_n040() {
    assert_eq!(radix_string(40u64, 12u64), "34");
}

#[test]
fn radix_b12_n041() {
    assert_eq!(radix_string(41u64, 12u64), "35");
}

#[test]
fn radix_b12_n042() {
    assert_eq!(radix_string(42u64, 12u64), "36");
}

#[test]
fn radix_b12_n043() {
    assert_eq!(radix_string(43u64, 12u64), "37");
}

#[test]
fn radix_b12_n044() {
    assert_eq!(radix_string(44u64, 12u64), "38");
}

#[test]
fn radix_b12_n045() {
    assert_eq!(radix_string(45u64, 12u64), "39");
}

#[test]
fn radix_b12_n046() {
    assert_eq!(radix_string(46u64, 12u64), "3a");
}

#[test]
fn radix_b12_n047() {
    assert_eq!(radix_string(47u64, 12u64), "3b");
}

#[test]
fn radix_b12_n048() {
    assert_eq!(radix_string(48u64, 12u64), "40");
}

#[test]
fn radix_b12_n049() {
    assert_eq!(radix_string(49u64, 12u64), "41");
}

#[test]
fn radix_b12_n050() {
    assert_eq!(radix_string(50u64, 12u64), "42");
}

#[test]
fn radix_b12_n051() {
    assert_eq!(radix_string(51u64, 12u64), "43");
}

#[test]
fn radix_b12_n052() {
    assert_eq!(radix_string(52u64, 12u64), "44");
}

#[test]
fn radix_b12_n053() {
    assert_eq!(radix_string(53u64, 12u64), "45");
}

#[test]
fn radix_b12_n054() {
    assert_eq!(radix_string(54u64, 12u64), "46");
}

#[test]
fn radix_b12_n055() {
    assert_eq!(radix_string(55u64, 12u64), "47");
}

#[test]
fn radix_b12_n056() {
    assert_eq!(radix_string(56u64, 12u64), "48");
}

#[test]
fn radix_b12_n057() {
    assert_eq!(radix_string(57u64, 12u64), "49");
}

#[test]
fn radix_b12_n058() {
    assert_eq!(radix_string(58u64, 12u64), "4a");
}

#[test]
fn radix_b12_n059() {
    assert_eq!(radix_string(59u64, 12u64), "4b");
}

#[test]
fn radix_b12_n060() {
    assert_eq!(radix_string(60u64, 12u64), "50");
}

#[test]
fn radix_b12_n061() {
    assert_eq!(radix_string(61u64, 12u64), "51");
}

#[test]
fn radix_b12_n062() {
    assert_eq!(radix_string(62u64, 12u64), "52");
}

#[test]
fn radix_b12_n063() {
    assert_eq!(radix_string(63u64, 12u64), "53");
}

#[test]
fn radix_b12_n064() {
    assert_eq!(radix_string(64u64, 12u64), "54");
}

#[test]
fn radix_b12_n065() {
    assert_eq!(radix_string(65u64, 12u64), "55");
}

#[test]
fn radix_b12_n066() {
    assert_eq!(radix_string(66u64, 12u64), "56");
}

#[test]
fn radix_b12_n067() {
    assert_eq!(radix_string(67u64, 12u64), "57");
}

#[test]
fn radix_b12_n068() {
    assert_eq!(radix_string(68u64, 12u64), "58");
}

#[test]
fn radix_b12_n069() {
    assert_eq!(radix_string(69u64, 12u64), "59");
}

#[test]
fn radix_b12_n070() {
    assert_eq!(radix_string(70u64, 12u64), "5a");
}

#[test]
fn radix_b12_n071() {
    assert_eq!(radix_string(71u64, 12u64), "5b");
}

#[test]
fn radix_b12_n072() {
    assert_eq!(radix_string(72u64, 12u64), "60");
}

#[test]
fn radix_b12_n073() {
    assert_eq!(radix_string(73u64, 12u64), "61");
}

#[test]
fn radix_b12_n074() {
    assert_eq!(radix_string(74u64, 12u64), "62");
}

#[test]
fn radix_b12_n075() {
    assert_eq!(radix_string(75u64, 12u64), "63");
}

#[test]
fn radix_b12_n076() {
    assert_eq!(radix_string(76u64, 12u64), "64");
}

#[test]
fn radix_b12_n077() {
    assert_eq!(radix_string(77u64, 12u64), "65");
}

#[test]
fn radix_b12_n078() {
    assert_eq!(radix_string(78u64, 12u64), "66");
}

#[test]
fn radix_b12_n079() {
    assert_eq!(radix_string(79u64, 12u64), "67");
}

#[test]
fn radix_b12_n080() {
    assert_eq!(radix_string(80u64, 12u64), "68");
}

#[test]
fn radix_b12_n081() {
    assert_eq!(radix_string(81u64, 12u64), "69");
}

#[test]
fn radix_b12_n082() {
    assert_eq!(radix_string(82u64, 12u64), "6a");
}

#[test]
fn radix_b12_n083() {
    assert_eq!(radix_string(83u64, 12u64), "6b");
}

#[test]
fn radix_b12_n084() {
    assert_eq!(radix_string(84u64, 12u64), "70");
}

#[test]
fn radix_b12_n085() {
    assert_eq!(radix_string(85u64, 12u64), "71");
}

#[test]
fn radix_b12_n086() {
    assert_eq!(radix_string(86u64, 12u64), "72");
}

#[test]
fn radix_b12_n087() {
    assert_eq!(radix_string(87u64, 12u64), "73");
}

#[test]
fn radix_b12_n088() {
    assert_eq!(radix_string(88u64, 12u64), "74");
}

#[test]
fn radix_b12_n089() {
    assert_eq!(radix_string(89u64, 12u64), "75");
}

#[test]
fn radix_b12_n090() {
    assert_eq!(radix_string(90u64, 12u64), "76");
}

#[test]
fn radix_b12_n091() {
    assert_eq!(radix_string(91u64, 12u64), "77");
}

#[test]
fn radix_b12_n092() {
    assert_eq!(radix_string(92u64, 12u64), "78");
}

#[test]
fn radix_b12_n093() {
    assert_eq!(radix_string(93u64, 12u64), "79");
}

#[test]
fn radix_b12_n094() {
    assert_eq!(radix_string(94u64, 12u64), "7a");
}

#[test]
fn radix_b12_n095() {
    assert_eq!(radix_string(95u64, 12u64), "7b");
}

#[test]
fn radix_b12_n096() {
    assert_eq!(radix_string(96u64, 12u64), "80");
}

#[test]
fn radix_b12_n097() {
    assert_eq!(radix_string(97u64, 12u64), "81");
}

#[test]
fn radix_b12_n098() {
    assert_eq!(radix_string(98u64, 12u64), "82");
}

#[test]
fn radix_b12_n099() {
    assert_eq!(radix_string(99u64, 12u64), "83");
}

#[test]
fn radix_b12_n100() {
    assert_eq!(radix_string(100u64, 12u64), "84");
}

#[test]
fn radix_b12_n101() {
    assert_eq!(radix_string(101u64, 12u64), "85");
}

#[test]
fn radix_b12_n102() {
    assert_eq!(radix_string(102u64, 12u64), "86");
}

#[test]
fn radix_b12_n103() {
    assert_eq!(radix_string(103u64, 12u64), "87");
}

#[test]
fn radix_b12_n104() {
    assert_eq!(radix_string(104u64, 12u64), "88");
}

#[test]
fn radix_b12_n105() {
    assert_eq!(radix_string(105u64, 12u64), "89");
}

#[test]
fn radix_b12_n106() {
    assert_eq!(radix_string(106u64, 12u64), "8a");
}

#[test]
fn radix_b12_n107() {
    assert_eq!(radix_string(107u64, 12u64), "8b");
}

#[test]
fn radix_b12_n108() {
    assert_eq!(radix_string(108u64, 12u64), "90");
}

#[test]
fn radix_b12_n109() {
    assert_eq!(radix_string(109u64, 12u64), "91");
}

#[test]
fn radix_b12_n110() {
    assert_eq!(radix_string(110u64, 12u64), "92");
}

#[test]
fn radix_b12_n111() {
    assert_eq!(radix_string(111u64, 12u64), "93");
}

#[test]
fn radix_b12_n112() {
    assert_eq!(radix_string(112u64, 12u64), "94");
}

#[test]
fn radix_b12_n113() {
    assert_eq!(radix_string(113u64, 12u64), "95");
}

#[test]
fn radix_b12_n114() {
    assert_eq!(radix_string(114u64, 12u64), "96");
}

#[test]
fn radix_b12_n115() {
    assert_eq!(radix_string(115u64, 12u64), "97");
}

#[test]
fn radix_b12_n116() {
    assert_eq!(radix_string(116u64, 12u64), "98");
}

#[test]
fn radix_b12_n117() {
    assert_eq!(radix_string(117u64, 12u64), "99");
}

#[test]
fn radix_b12_n118() {
    assert_eq!(radix_string(118u64, 12u64), "9a");
}

#[test]
fn radix_b12_n119() {
    assert_eq!(radix_string(119u64, 12u64), "9b");
}

#[test]
fn radix_b16_n000() {
    assert_eq!(radix_string(0u64, 16u64), "0");
}

#[test]
fn radix_b16_n001() {
    assert_eq!(radix_string(1u64, 16u64), "1");
}

#[test]
fn radix_b16_n002() {
    assert_eq!(radix_string(2u64, 16u64), "2");
}

#[test]
fn radix_b16_n003() {
    assert_eq!(radix_string(3u64, 16u64), "3");
}

#[test]
fn radix_b16_n004() {
    assert_eq!(radix_string(4u64, 16u64), "4");
}

#[test]
fn radix_b16_n005() {
    assert_eq!(radix_string(5u64, 16u64), "5");
}

#[test]
fn radix_b16_n006() {
    assert_eq!(radix_string(6u64, 16u64), "6");
}

#[test]
fn radix_b16_n007() {
    assert_eq!(radix_string(7u64, 16u64), "7");
}

#[test]
fn radix_b16_n008() {
    assert_eq!(radix_string(8u64, 16u64), "8");
}

#[test]
fn radix_b16_n009() {
    assert_eq!(radix_string(9u64, 16u64), "9");
}

#[test]
fn radix_b16_n010() {
    assert_eq!(radix_string(10u64, 16u64), "a");
}

#[test]
fn radix_b16_n011() {
    assert_eq!(radix_string(11u64, 16u64), "b");
}

#[test]
fn radix_b16_n012() {
    assert_eq!(radix_string(12u64, 16u64), "c");
}

#[test]
fn radix_b16_n013() {
    assert_eq!(radix_string(13u64, 16u64), "d");
}

#[test]
fn radix_b16_n014() {
    assert_eq!(radix_string(14u64, 16u64), "e");
}

#[test]
fn radix_b16_n015() {
    assert_eq!(radix_string(15u64, 16u64), "f");
}

#[test]
fn radix_b16_n016() {
    assert_eq!(radix_string(16u64, 16u64), "10");
}

#[test]
fn radix_b16_n017() {
    assert_eq!(radix_string(17u64, 16u64), "11");
}

#[test]
fn radix_b16_n018() {
    assert_eq!(radix_string(18u64, 16u64), "12");
}

#[test]
fn radix_b16_n019() {
    assert_eq!(radix_string(19u64, 16u64), "13");
}

#[test]
fn radix_b16_n020() {
    assert_eq!(radix_string(20u64, 16u64), "14");
}

#[test]
fn radix_b16_n021() {
    assert_eq!(radix_string(21u64, 16u64), "15");
}

#[test]
fn radix_b16_n022() {
    assert_eq!(radix_string(22u64, 16u64), "16");
}

#[test]
fn radix_b16_n023() {
    assert_eq!(radix_string(23u64, 16u64), "17");
}

#[test]
fn radix_b16_n024() {
    assert_eq!(radix_string(24u64, 16u64), "18");
}

#[test]
fn radix_b16_n025() {
    assert_eq!(radix_string(25u64, 16u64), "19");
}

#[test]
fn radix_b16_n026() {
    assert_eq!(radix_string(26u64, 16u64), "1a");
}

#[test]
fn radix_b16_n027() {
    assert_eq!(radix_string(27u64, 16u64), "1b");
}

#[test]
fn radix_b16_n028() {
    assert_eq!(radix_string(28u64, 16u64), "1c");
}

#[test]
fn radix_b16_n029() {
    assert_eq!(radix_string(29u64, 16u64), "1d");
}

#[test]
fn radix_b16_n030() {
    assert_eq!(radix_string(30u64, 16u64), "1e");
}

#[test]
fn radix_b16_n031() {
    assert_eq!(radix_string(31u64, 16u64), "1f");
}

#[test]
fn radix_b16_n032() {
    assert_eq!(radix_string(32u64, 16u64), "20");
}

#[test]
fn radix_b16_n033() {
    assert_eq!(radix_string(33u64, 16u64), "21");
}

#[test]
fn radix_b16_n034() {
    assert_eq!(radix_string(34u64, 16u64), "22");
}

#[test]
fn radix_b16_n035() {
    assert_eq!(radix_string(35u64, 16u64), "23");
}

#[test]
fn radix_b16_n036() {
    assert_eq!(radix_string(36u64, 16u64), "24");
}

#[test]
fn radix_b16_n037() {
    assert_eq!(radix_string(37u64, 16u64), "25");
}

#[test]
fn radix_b16_n038() {
    assert_eq!(radix_string(38u64, 16u64), "26");
}

#[test]
fn radix_b16_n039() {
    assert_eq!(radix_string(39u64, 16u64), "27");
}

#[test]
fn radix_b16_n040() {
    assert_eq!(radix_string(40u64, 16u64), "28");
}

#[test]
fn radix_b16_n041() {
    assert_eq!(radix_string(41u64, 16u64), "29");
}

#[test]
fn radix_b16_n042() {
    assert_eq!(radix_string(42u64, 16u64), "2a");
}

#[test]
fn radix_b16_n043() {
    assert_eq!(radix_string(43u64, 16u64), "2b");
}

#[test]
fn radix_b16_n044() {
    assert_eq!(radix_string(44u64, 16u64), "2c");
}

#[test]
fn radix_b16_n045() {
    assert_eq!(radix_string(45u64, 16u64), "2d");
}

#[test]
fn radix_b16_n046() {
    assert_eq!(radix_string(46u64, 16u64), "2e");
}

#[test]
fn radix_b16_n047() {
    assert_eq!(radix_string(47u64, 16u64), "2f");
}

#[test]
fn radix_b16_n048() {
    assert_eq!(radix_string(48u64, 16u64), "30");
}

#[test]
fn radix_b16_n049() {
    assert_eq!(radix_string(49u64, 16u64), "31");
}

#[test]
fn radix_b16_n050() {
    assert_eq!(radix_string(50u64, 16u64), "32");
}

#[test]
fn radix_b16_n051() {
    assert_eq!(radix_string(51u64, 16u64), "33");
}

#[test]
fn radix_b16_n052() {
    assert_eq!(radix_string(52u64, 16u64), "34");
}

#[test]
fn radix_b16_n053() {
    assert_eq!(radix_string(53u64, 16u64), "35");
}

#[test]
fn radix_b16_n054() {
    assert_eq!(radix_string(54u64, 16u64), "36");
}

#[test]
fn radix_b16_n055() {
    assert_eq!(radix_string(55u64, 16u64), "37");
}

#[test]
fn radix_b16_n056() {
    assert_eq!(radix_string(56u64, 16u64), "38");
}

#[test]
fn radix_b16_n057() {
    assert_eq!(radix_string(57u64, 16u64), "39");
}

#[test]
fn radix_b16_n058() {
    assert_eq!(radix_string(58u64, 16u64), "3a");
}

#[test]
fn radix_b16_n059() {
    assert_eq!(radix_string(59u64, 16u64), "3b");
}

#[test]
fn radix_b16_n060() {
    assert_eq!(radix_string(60u64, 16u64), "3c");
}

#[test]
fn radix_b16_n061() {
    assert_eq!(radix_string(61u64, 16u64), "3d");
}

#[test]
fn radix_b16_n062() {
    assert_eq!(radix_string(62u64, 16u64), "3e");
}

#[test]
fn radix_b16_n063() {
    assert_eq!(radix_string(63u64, 16u64), "3f");
}

#[test]
fn radix_b16_n064() {
    assert_eq!(radix_string(64u64, 16u64), "40");
}

#[test]
fn radix_b16_n065() {
    assert_eq!(radix_string(65u64, 16u64), "41");
}

#[test]
fn radix_b16_n066() {
    assert_eq!(radix_string(66u64, 16u64), "42");
}

#[test]
fn radix_b16_n067() {
    assert_eq!(radix_string(67u64, 16u64), "43");
}

#[test]
fn radix_b16_n068() {
    assert_eq!(radix_string(68u64, 16u64), "44");
}

#[test]
fn radix_b16_n069() {
    assert_eq!(radix_string(69u64, 16u64), "45");
}

#[test]
fn radix_b16_n070() {
    assert_eq!(radix_string(70u64, 16u64), "46");
}

#[test]
fn radix_b16_n071() {
    assert_eq!(radix_string(71u64, 16u64), "47");
}

#[test]
fn radix_b16_n072() {
    assert_eq!(radix_string(72u64, 16u64), "48");
}

#[test]
fn radix_b16_n073() {
    assert_eq!(radix_string(73u64, 16u64), "49");
}

#[test]
fn radix_b16_n074() {
    assert_eq!(radix_string(74u64, 16u64), "4a");
}

#[test]
fn radix_b16_n075() {
    assert_eq!(radix_string(75u64, 16u64), "4b");
}

#[test]
fn radix_b16_n076() {
    assert_eq!(radix_string(76u64, 16u64), "4c");
}

#[test]
fn radix_b16_n077() {
    assert_eq!(radix_string(77u64, 16u64), "4d");
}

#[test]
fn radix_b16_n078() {
    assert_eq!(radix_string(78u64, 16u64), "4e");
}

#[test]
fn radix_b16_n079() {
    assert_eq!(radix_string(79u64, 16u64), "4f");
}

#[test]
fn radix_b16_n080() {
    assert_eq!(radix_string(80u64, 16u64), "50");
}

#[test]
fn radix_b16_n081() {
    assert_eq!(radix_string(81u64, 16u64), "51");
}

#[test]
fn radix_b16_n082() {
    assert_eq!(radix_string(82u64, 16u64), "52");
}

#[test]
fn radix_b16_n083() {
    assert_eq!(radix_string(83u64, 16u64), "53");
}

#[test]
fn radix_b16_n084() {
    assert_eq!(radix_string(84u64, 16u64), "54");
}

#[test]
fn radix_b16_n085() {
    assert_eq!(radix_string(85u64, 16u64), "55");
}

#[test]
fn radix_b16_n086() {
    assert_eq!(radix_string(86u64, 16u64), "56");
}

#[test]
fn radix_b16_n087() {
    assert_eq!(radix_string(87u64, 16u64), "57");
}

#[test]
fn radix_b16_n088() {
    assert_eq!(radix_string(88u64, 16u64), "58");
}

#[test]
fn radix_b16_n089() {
    assert_eq!(radix_string(89u64, 16u64), "59");
}

#[test]
fn radix_b16_n090() {
    assert_eq!(radix_string(90u64, 16u64), "5a");
}

#[test]
fn radix_b16_n091() {
    assert_eq!(radix_string(91u64, 16u64), "5b");
}

#[test]
fn radix_b16_n092() {
    assert_eq!(radix_string(92u64, 16u64), "5c");
}

#[test]
fn radix_b16_n093() {
    assert_eq!(radix_string(93u64, 16u64), "5d");
}

#[test]
fn radix_b16_n094() {
    assert_eq!(radix_string(94u64, 16u64), "5e");
}

#[test]
fn radix_b16_n095() {
    assert_eq!(radix_string(95u64, 16u64), "5f");
}

#[test]
fn radix_b16_n096() {
    assert_eq!(radix_string(96u64, 16u64), "60");
}

#[test]
fn radix_b16_n097() {
    assert_eq!(radix_string(97u64, 16u64), "61");
}

#[test]
fn radix_b16_n098() {
    assert_eq!(radix_string(98u64, 16u64), "62");
}

#[test]
fn radix_b16_n099() {
    assert_eq!(radix_string(99u64, 16u64), "63");
}

#[test]
fn radix_b16_n100() {
    assert_eq!(radix_string(100u64, 16u64), "64");
}

#[test]
fn radix_b16_n101() {
    assert_eq!(radix_string(101u64, 16u64), "65");
}

#[test]
fn radix_b16_n102() {
    assert_eq!(radix_string(102u64, 16u64), "66");
}

#[test]
fn radix_b16_n103() {
    assert_eq!(radix_string(103u64, 16u64), "67");
}

#[test]
fn radix_b16_n104() {
    assert_eq!(radix_string(104u64, 16u64), "68");
}

#[test]
fn radix_b16_n105() {
    assert_eq!(radix_string(105u64, 16u64), "69");
}

#[test]
fn radix_b16_n106() {
    assert_eq!(radix_string(106u64, 16u64), "6a");
}

#[test]
fn radix_b16_n107() {
    assert_eq!(radix_string(107u64, 16u64), "6b");
}

#[test]
fn radix_b16_n108() {
    assert_eq!(radix_string(108u64, 16u64), "6c");
}

#[test]
fn radix_b16_n109() {
    assert_eq!(radix_string(109u64, 16u64), "6d");
}

#[test]
fn radix_b16_n110() {
    assert_eq!(radix_string(110u64, 16u64), "6e");
}

#[test]
fn radix_b16_n111() {
    assert_eq!(radix_string(111u64, 16u64), "6f");
}

#[test]
fn radix_b16_n112() {
    assert_eq!(radix_string(112u64, 16u64), "70");
}

#[test]
fn radix_b16_n113() {
    assert_eq!(radix_string(113u64, 16u64), "71");
}

#[test]
fn radix_b16_n114() {
    assert_eq!(radix_string(114u64, 16u64), "72");
}

#[test]
fn radix_b16_n115() {
    assert_eq!(radix_string(115u64, 16u64), "73");
}

#[test]
fn radix_b16_n116() {
    assert_eq!(radix_string(116u64, 16u64), "74");
}

#[test]
fn radix_b16_n117() {
    assert_eq!(radix_string(117u64, 16u64), "75");
}

#[test]
fn radix_b16_n118() {
    assert_eq!(radix_string(118u64, 16u64), "76");
}

#[test]
fn radix_b16_n119() {
    assert_eq!(radix_string(119u64, 16u64), "77");
}

#[test]
fn radix_b20_n000() {
    assert_eq!(radix_string(0u64, 20u64), "0");
}

#[test]
fn radix_b20_n001() {
    assert_eq!(radix_string(1u64, 20u64), "1");
}

#[test]
fn radix_b20_n002() {
    assert_eq!(radix_string(2u64, 20u64), "2");
}

#[test]
fn radix_b20_n003() {
    assert_eq!(radix_string(3u64, 20u64), "3");
}

#[test]
fn radix_b20_n004() {
    assert_eq!(radix_string(4u64, 20u64), "4");
}

#[test]
fn radix_b20_n005() {
    assert_eq!(radix_string(5u64, 20u64), "5");
}

#[test]
fn radix_b20_n006() {
    assert_eq!(radix_string(6u64, 20u64), "6");
}

#[test]
fn radix_b20_n007() {
    assert_eq!(radix_string(7u64, 20u64), "7");
}

#[test]
fn radix_b20_n008() {
    assert_eq!(radix_string(8u64, 20u64), "8");
}

#[test]
fn radix_b20_n009() {
    assert_eq!(radix_string(9u64, 20u64), "9");
}

#[test]
fn radix_b20_n010() {
    assert_eq!(radix_string(10u64, 20u64), "a");
}

#[test]
fn radix_b20_n011() {
    assert_eq!(radix_string(11u64, 20u64), "b");
}

#[test]
fn radix_b20_n012() {
    assert_eq!(radix_string(12u64, 20u64), "c");
}

#[test]
fn radix_b20_n013() {
    assert_eq!(radix_string(13u64, 20u64), "d");
}

#[test]
fn radix_b20_n014() {
    assert_eq!(radix_string(14u64, 20u64), "e");
}

#[test]
fn radix_b20_n015() {
    assert_eq!(radix_string(15u64, 20u64), "f");
}

#[test]
fn radix_b20_n016() {
    assert_eq!(radix_string(16u64, 20u64), "g");
}

#[test]
fn radix_b20_n017() {
    assert_eq!(radix_string(17u64, 20u64), "h");
}

#[test]
fn radix_b20_n018() {
    assert_eq!(radix_string(18u64, 20u64), "i");
}

#[test]
fn radix_b20_n019() {
    assert_eq!(radix_string(19u64, 20u64), "j");
}

#[test]
fn radix_b20_n020() {
    assert_eq!(radix_string(20u64, 20u64), "10");
}

#[test]
fn radix_b20_n021() {
    assert_eq!(radix_string(21u64, 20u64), "11");
}

#[test]
fn radix_b20_n022() {
    assert_eq!(radix_string(22u64, 20u64), "12");
}

#[test]
fn radix_b20_n023() {
    assert_eq!(radix_string(23u64, 20u64), "13");
}

#[test]
fn radix_b20_n024() {
    assert_eq!(radix_string(24u64, 20u64), "14");
}

#[test]
fn radix_b20_n025() {
    assert_eq!(radix_string(25u64, 20u64), "15");
}

#[test]
fn radix_b20_n026() {
    assert_eq!(radix_string(26u64, 20u64), "16");
}

#[test]
fn radix_b20_n027() {
    assert_eq!(radix_string(27u64, 20u64), "17");
}

#[test]
fn radix_b20_n028() {
    assert_eq!(radix_string(28u64, 20u64), "18");
}

#[test]
fn radix_b20_n029() {
    assert_eq!(radix_string(29u64, 20u64), "19");
}

#[test]
fn radix_b20_n030() {
    assert_eq!(radix_string(30u64, 20u64), "1a");
}

#[test]
fn radix_b20_n031() {
    assert_eq!(radix_string(31u64, 20u64), "1b");
}

#[test]
fn radix_b20_n032() {
    assert_eq!(radix_string(32u64, 20u64), "1c");
}

#[test]
fn radix_b20_n033() {
    assert_eq!(radix_string(33u64, 20u64), "1d");
}

#[test]
fn radix_b20_n034() {
    assert_eq!(radix_string(34u64, 20u64), "1e");
}

#[test]
fn radix_b20_n035() {
    assert_eq!(radix_string(35u64, 20u64), "1f");
}

#[test]
fn radix_b20_n036() {
    assert_eq!(radix_string(36u64, 20u64), "1g");
}

#[test]
fn radix_b20_n037() {
    assert_eq!(radix_string(37u64, 20u64), "1h");
}

#[test]
fn radix_b20_n038() {
    assert_eq!(radix_string(38u64, 20u64), "1i");
}

#[test]
fn radix_b20_n039() {
    assert_eq!(radix_string(39u64, 20u64), "1j");
}

#[test]
fn radix_b20_n040() {
    assert_eq!(radix_string(40u64, 20u64), "20");
}

#[test]
fn radix_b20_n041() {
    assert_eq!(radix_string(41u64, 20u64), "21");
}

#[test]
fn radix_b20_n042() {
    assert_eq!(radix_string(42u64, 20u64), "22");
}

#[test]
fn radix_b20_n043() {
    assert_eq!(radix_string(43u64, 20u64), "23");
}

#[test]
fn radix_b20_n044() {
    assert_eq!(radix_string(44u64, 20u64), "24");
}

#[test]
fn radix_b20_n045() {
    assert_eq!(radix_string(45u64, 20u64), "25");
}

#[test]
fn radix_b20_n046() {
    assert_eq!(radix_string(46u64, 20u64), "26");
}

#[test]
fn radix_b20_n047() {
    assert_eq!(radix_string(47u64, 20u64), "27");
}

#[test]
fn radix_b20_n048() {
    assert_eq!(radix_string(48u64, 20u64), "28");
}

#[test]
fn radix_b20_n049() {
    assert_eq!(radix_string(49u64, 20u64), "29");
}

#[test]
fn radix_b20_n050() {
    assert_eq!(radix_string(50u64, 20u64), "2a");
}

#[test]
fn radix_b20_n051() {
    assert_eq!(radix_string(51u64, 20u64), "2b");
}

#[test]
fn radix_b20_n052() {
    assert_eq!(radix_string(52u64, 20u64), "2c");
}

#[test]
fn radix_b20_n053() {
    assert_eq!(radix_string(53u64, 20u64), "2d");
}

#[test]
fn radix_b20_n054() {
    assert_eq!(radix_string(54u64, 20u64), "2e");
}

#[test]
fn radix_b20_n055() {
    assert_eq!(radix_string(55u64, 20u64), "2f");
}

#[test]
fn radix_b20_n056() {
    assert_eq!(radix_string(56u64, 20u64), "2g");
}

#[test]
fn radix_b20_n057() {
    assert_eq!(radix_string(57u64, 20u64), "2h");
}

#[test]
fn radix_b20_n058() {
    assert_eq!(radix_string(58u64, 20u64), "2i");
}

#[test]
fn radix_b20_n059() {
    assert_eq!(radix_string(59u64, 20u64), "2j");
}

#[test]
fn radix_b20_n060() {
    assert_eq!(radix_string(60u64, 20u64), "30");
}

#[test]
fn radix_b20_n061() {
    assert_eq!(radix_string(61u64, 20u64), "31");
}

#[test]
fn radix_b20_n062() {
    assert_eq!(radix_string(62u64, 20u64), "32");
}

#[test]
fn radix_b20_n063() {
    assert_eq!(radix_string(63u64, 20u64), "33");
}

#[test]
fn radix_b20_n064() {
    assert_eq!(radix_string(64u64, 20u64), "34");
}

#[test]
fn radix_b20_n065() {
    assert_eq!(radix_string(65u64, 20u64), "35");
}

#[test]
fn radix_b20_n066() {
    assert_eq!(radix_string(66u64, 20u64), "36");
}

#[test]
fn radix_b20_n067() {
    assert_eq!(radix_string(67u64, 20u64), "37");
}

#[test]
fn radix_b20_n068() {
    assert_eq!(radix_string(68u64, 20u64), "38");
}

#[test]
fn radix_b20_n069() {
    assert_eq!(radix_string(69u64, 20u64), "39");
}

#[test]
fn radix_b20_n070() {
    assert_eq!(radix_string(70u64, 20u64), "3a");
}

#[test]
fn radix_b20_n071() {
    assert_eq!(radix_string(71u64, 20u64), "3b");
}

#[test]
fn radix_b20_n072() {
    assert_eq!(radix_string(72u64, 20u64), "3c");
}

#[test]
fn radix_b20_n073() {
    assert_eq!(radix_string(73u64, 20u64), "3d");
}

#[test]
fn radix_b20_n074() {
    assert_eq!(radix_string(74u64, 20u64), "3e");
}

#[test]
fn radix_b20_n075() {
    assert_eq!(radix_string(75u64, 20u64), "3f");
}

#[test]
fn radix_b20_n076() {
    assert_eq!(radix_string(76u64, 20u64), "3g");
}

#[test]
fn radix_b20_n077() {
    assert_eq!(radix_string(77u64, 20u64), "3h");
}

#[test]
fn radix_b20_n078() {
    assert_eq!(radix_string(78u64, 20u64), "3i");
}

#[test]
fn radix_b20_n079() {
    assert_eq!(radix_string(79u64, 20u64), "3j");
}

#[test]
fn radix_b20_n080() {
    assert_eq!(radix_string(80u64, 20u64), "40");
}

#[test]
fn radix_b20_n081() {
    assert_eq!(radix_string(81u64, 20u64), "41");
}

#[test]
fn radix_b20_n082() {
    assert_eq!(radix_string(82u64, 20u64), "42");
}

#[test]
fn radix_b20_n083() {
    assert_eq!(radix_string(83u64, 20u64), "43");
}

#[test]
fn radix_b20_n084() {
    assert_eq!(radix_string(84u64, 20u64), "44");
}

#[test]
fn radix_b20_n085() {
    assert_eq!(radix_string(85u64, 20u64), "45");
}

#[test]
fn radix_b20_n086() {
    assert_eq!(radix_string(86u64, 20u64), "46");
}

#[test]
fn radix_b20_n087() {
    assert_eq!(radix_string(87u64, 20u64), "47");
}

#[test]
fn radix_b20_n088() {
    assert_eq!(radix_string(88u64, 20u64), "48");
}

#[test]
fn radix_b20_n089() {
    assert_eq!(radix_string(89u64, 20u64), "49");
}

#[test]
fn radix_b20_n090() {
    assert_eq!(radix_string(90u64, 20u64), "4a");
}

#[test]
fn radix_b20_n091() {
    assert_eq!(radix_string(91u64, 20u64), "4b");
}

#[test]
fn radix_b20_n092() {
    assert_eq!(radix_string(92u64, 20u64), "4c");
}

#[test]
fn radix_b20_n093() {
    assert_eq!(radix_string(93u64, 20u64), "4d");
}

#[test]
fn radix_b20_n094() {
    assert_eq!(radix_string(94u64, 20u64), "4e");
}

#[test]
fn radix_b20_n095() {
    assert_eq!(radix_string(95u64, 20u64), "4f");
}

#[test]
fn radix_b20_n096() {
    assert_eq!(radix_string(96u64, 20u64), "4g");
}

#[test]
fn radix_b20_n097() {
    assert_eq!(radix_string(97u64, 20u64), "4h");
}

#[test]
fn radix_b20_n098() {
    assert_eq!(radix_string(98u64, 20u64), "4i");
}

#[test]
fn radix_b20_n099() {
    assert_eq!(radix_string(99u64, 20u64), "4j");
}

#[test]
fn radix_b20_n100() {
    assert_eq!(radix_string(100u64, 20u64), "50");
}

#[test]
fn radix_b20_n101() {
    assert_eq!(radix_string(101u64, 20u64), "51");
}

#[test]
fn radix_b20_n102() {
    assert_eq!(radix_string(102u64, 20u64), "52");
}

#[test]
fn radix_b20_n103() {
    assert_eq!(radix_string(103u64, 20u64), "53");
}

#[test]
fn radix_b20_n104() {
    assert_eq!(radix_string(104u64, 20u64), "54");
}

#[test]
fn radix_b20_n105() {
    assert_eq!(radix_string(105u64, 20u64), "55");
}

#[test]
fn radix_b20_n106() {
    assert_eq!(radix_string(106u64, 20u64), "56");
}

#[test]
fn radix_b20_n107() {
    assert_eq!(radix_string(107u64, 20u64), "57");
}

#[test]
fn radix_b20_n108() {
    assert_eq!(radix_string(108u64, 20u64), "58");
}

#[test]
fn radix_b20_n109() {
    assert_eq!(radix_string(109u64, 20u64), "59");
}

#[test]
fn radix_b20_n110() {
    assert_eq!(radix_string(110u64, 20u64), "5a");
}

#[test]
fn radix_b20_n111() {
    assert_eq!(radix_string(111u64, 20u64), "5b");
}

#[test]
fn radix_b20_n112() {
    assert_eq!(radix_string(112u64, 20u64), "5c");
}

#[test]
fn radix_b20_n113() {
    assert_eq!(radix_string(113u64, 20u64), "5d");
}

#[test]
fn radix_b20_n114() {
    assert_eq!(radix_string(114u64, 20u64), "5e");
}

#[test]
fn radix_b20_n115() {
    assert_eq!(radix_string(115u64, 20u64), "5f");
}

#[test]
fn radix_b20_n116() {
    assert_eq!(radix_string(116u64, 20u64), "5g");
}

#[test]
fn radix_b20_n117() {
    assert_eq!(radix_string(117u64, 20u64), "5h");
}

#[test]
fn radix_b20_n118() {
    assert_eq!(radix_string(118u64, 20u64), "5i");
}

#[test]
fn radix_b20_n119() {
    assert_eq!(radix_string(119u64, 20u64), "5j");
}

#[test]
fn radix_b32_n000() {
    assert_eq!(radix_string(0u64, 32u64), "0");
}

#[test]
fn radix_b32_n001() {
    assert_eq!(radix_string(1u64, 32u64), "1");
}

#[test]
fn radix_b32_n002() {
    assert_eq!(radix_string(2u64, 32u64), "2");
}

#[test]
fn radix_b32_n003() {
    assert_eq!(radix_string(3u64, 32u64), "3");
}

#[test]
fn radix_b32_n004() {
    assert_eq!(radix_string(4u64, 32u64), "4");
}

#[test]
fn radix_b32_n005() {
    assert_eq!(radix_string(5u64, 32u64), "5");
}

#[test]
fn radix_b32_n006() {
    assert_eq!(radix_string(6u64, 32u64), "6");
}

#[test]
fn radix_b32_n007() {
    assert_eq!(radix_string(7u64, 32u64), "7");
}

#[test]
fn radix_b32_n008() {
    assert_eq!(radix_string(8u64, 32u64), "8");
}

#[test]
fn radix_b32_n009() {
    assert_eq!(radix_string(9u64, 32u64), "9");
}

#[test]
fn radix_b32_n010() {
    assert_eq!(radix_string(10u64, 32u64), "a");
}

#[test]
fn radix_b32_n011() {
    assert_eq!(radix_string(11u64, 32u64), "b");
}

#[test]
fn radix_b32_n012() {
    assert_eq!(radix_string(12u64, 32u64), "c");
}

#[test]
fn radix_b32_n013() {
    assert_eq!(radix_string(13u64, 32u64), "d");
}

#[test]
fn radix_b32_n014() {
    assert_eq!(radix_string(14u64, 32u64), "e");
}

#[test]
fn radix_b32_n015() {
    assert_eq!(radix_string(15u64, 32u64), "f");
}

#[test]
fn radix_b32_n016() {
    assert_eq!(radix_string(16u64, 32u64), "g");
}

#[test]
fn radix_b32_n017() {
    assert_eq!(radix_string(17u64, 32u64), "h");
}

#[test]
fn radix_b32_n018() {
    assert_eq!(radix_string(18u64, 32u64), "i");
}

#[test]
fn radix_b32_n019() {
    assert_eq!(radix_string(19u64, 32u64), "j");
}

#[test]
fn radix_b32_n020() {
    assert_eq!(radix_string(20u64, 32u64), "k");
}

#[test]
fn radix_b32_n021() {
    assert_eq!(radix_string(21u64, 32u64), "l");
}

#[test]
fn radix_b32_n022() {
    assert_eq!(radix_string(22u64, 32u64), "m");
}

#[test]
fn radix_b32_n023() {
    assert_eq!(radix_string(23u64, 32u64), "n");
}

#[test]
fn radix_b32_n024() {
    assert_eq!(radix_string(24u64, 32u64), "o");
}

#[test]
fn radix_b32_n025() {
    assert_eq!(radix_string(25u64, 32u64), "p");
}

#[test]
fn radix_b32_n026() {
    assert_eq!(radix_string(26u64, 32u64), "q");
}

#[test]
fn radix_b32_n027() {
    assert_eq!(radix_string(27u64, 32u64), "r");
}

#[test]
fn radix_b32_n028() {
    assert_eq!(radix_string(28u64, 32u64), "s");
}

#[test]
fn radix_b32_n029() {
    assert_eq!(radix_string(29u64, 32u64), "t");
}

#[test]
fn radix_b32_n030() {
    assert_eq!(radix_string(30u64, 32u64), "u");
}

#[test]
fn radix_b32_n031() {
    assert_eq!(radix_string(31u64, 32u64), "v");
}

#[test]
fn radix_b32_n032() {
    assert_eq!(radix_string(32u64, 32u64), "10");
}

#[test]
fn radix_b32_n033() {
    assert_eq!(radix_string(33u64, 32u64), "11");
}

#[test]
fn radix_b32_n034() {
    assert_eq!(radix_string(34u64, 32u64), "12");
}

#[test]
fn radix_b32_n035() {
    assert_eq!(radix_string(35u64, 32u64), "13");
}

#[test]
fn radix_b32_n036() {
    assert_eq!(radix_string(36u64, 32u64), "14");
}

#[test]
fn radix_b32_n037() {
    assert_eq!(radix_string(37u64, 32u64), "15");
}

#[test]
fn radix_b32_n038() {
    assert_eq!(radix_string(38u64, 32u64), "16");
}

#[test]
fn radix_b32_n039() {
    assert_eq!(radix_string(39u64, 32u64), "17");
}

#[test]
fn radix_b32_n040() {
    assert_eq!(radix_string(40u64, 32u64), "18");
}

#[test]
fn radix_b32_n041() {
    assert_eq!(radix_string(41u64, 32u64), "19");
}

#[test]
fn radix_b32_n042() {
    assert_eq!(radix_string(42u64, 32u64), "1a");
}

#[test]
fn radix_b32_n043() {
    assert_eq!(radix_string(43u64, 32u64), "1b");
}

#[test]
fn radix_b32_n044() {
    assert_eq!(radix_string(44u64, 32u64), "1c");
}

#[test]
fn radix_b32_n045() {
    assert_eq!(radix_string(45u64, 32u64), "1d");
}

#[test]
fn radix_b32_n046() {
    assert_eq!(radix_string(46u64, 32u64), "1e");
}

#[test]
fn radix_b32_n047() {
    assert_eq!(radix_string(47u64, 32u64), "1f");
}

#[test]
fn radix_b32_n048() {
    assert_eq!(radix_string(48u64, 32u64), "1g");
}

#[test]
fn radix_b32_n049() {
    assert_eq!(radix_string(49u64, 32u64), "1h");
}

#[test]
fn radix_b32_n050() {
    assert_eq!(radix_string(50u64, 32u64), "1i");
}

#[test]
fn radix_b32_n051() {
    assert_eq!(radix_string(51u64, 32u64), "1j");
}

#[test]
fn radix_b32_n052() {
    assert_eq!(radix_string(52u64, 32u64), "1k");
}

#[test]
fn radix_b32_n053() {
    assert_eq!(radix_string(53u64, 32u64), "1l");
}

#[test]
fn radix_b32_n054() {
    assert_eq!(radix_string(54u64, 32u64), "1m");
}

#[test]
fn radix_b32_n055() {
    assert_eq!(radix_string(55u64, 32u64), "1n");
}

#[test]
fn radix_b32_n056() {
    assert_eq!(radix_string(56u64, 32u64), "1o");
}

#[test]
fn radix_b32_n057() {
    assert_eq!(radix_string(57u64, 32u64), "1p");
}

#[test]
fn radix_b32_n058() {
    assert_eq!(radix_string(58u64, 32u64), "1q");
}

#[test]
fn radix_b32_n059() {
    assert_eq!(radix_string(59u64, 32u64), "1r");
}

#[test]
fn radix_b32_n060() {
    assert_eq!(radix_string(60u64, 32u64), "1s");
}

#[test]
fn radix_b32_n061() {
    assert_eq!(radix_string(61u64, 32u64), "1t");
}

#[test]
fn radix_b32_n062() {
    assert_eq!(radix_string(62u64, 32u64), "1u");
}

#[test]
fn radix_b32_n063() {
    assert_eq!(radix_string(63u64, 32u64), "1v");
}

#[test]
fn radix_b32_n064() {
    assert_eq!(radix_string(64u64, 32u64), "20");
}

#[test]
fn radix_b32_n065() {
    assert_eq!(radix_string(65u64, 32u64), "21");
}

#[test]
fn radix_b32_n066() {
    assert_eq!(radix_string(66u64, 32u64), "22");
}

#[test]
fn radix_b32_n067() {
    assert_eq!(radix_string(67u64, 32u64), "23");
}

#[test]
fn radix_b32_n068() {
    assert_eq!(radix_string(68u64, 32u64), "24");
}

#[test]
fn radix_b32_n069() {
    assert_eq!(radix_string(69u64, 32u64), "25");
}

#[test]
fn radix_b32_n070() {
    assert_eq!(radix_string(70u64, 32u64), "26");
}

#[test]
fn radix_b32_n071() {
    assert_eq!(radix_string(71u64, 32u64), "27");
}

#[test]
fn radix_b32_n072() {
    assert_eq!(radix_string(72u64, 32u64), "28");
}

#[test]
fn radix_b32_n073() {
    assert_eq!(radix_string(73u64, 32u64), "29");
}

#[test]
fn radix_b32_n074() {
    assert_eq!(radix_string(74u64, 32u64), "2a");
}

#[test]
fn radix_b32_n075() {
    assert_eq!(radix_string(75u64, 32u64), "2b");
}

#[test]
fn radix_b32_n076() {
    assert_eq!(radix_string(76u64, 32u64), "2c");
}

#[test]
fn radix_b32_n077() {
    assert_eq!(radix_string(77u64, 32u64), "2d");
}

#[test]
fn radix_b32_n078() {
    assert_eq!(radix_string(78u64, 32u64), "2e");
}

#[test]
fn radix_b32_n079() {
    assert_eq!(radix_string(79u64, 32u64), "2f");
}

#[test]
fn radix_b32_n080() {
    assert_eq!(radix_string(80u64, 32u64), "2g");
}

#[test]
fn radix_b32_n081() {
    assert_eq!(radix_string(81u64, 32u64), "2h");
}

#[test]
fn radix_b32_n082() {
    assert_eq!(radix_string(82u64, 32u64), "2i");
}

#[test]
fn radix_b32_n083() {
    assert_eq!(radix_string(83u64, 32u64), "2j");
}

#[test]
fn radix_b32_n084() {
    assert_eq!(radix_string(84u64, 32u64), "2k");
}

#[test]
fn radix_b32_n085() {
    assert_eq!(radix_string(85u64, 32u64), "2l");
}

#[test]
fn radix_b32_n086() {
    assert_eq!(radix_string(86u64, 32u64), "2m");
}

#[test]
fn radix_b32_n087() {
    assert_eq!(radix_string(87u64, 32u64), "2n");
}

#[test]
fn radix_b32_n088() {
    assert_eq!(radix_string(88u64, 32u64), "2o");
}

#[test]
fn radix_b32_n089() {
    assert_eq!(radix_string(89u64, 32u64), "2p");
}

#[test]
fn radix_b32_n090() {
    assert_eq!(radix_string(90u64, 32u64), "2q");
}

#[test]
fn radix_b32_n091() {
    assert_eq!(radix_string(91u64, 32u64), "2r");
}

#[test]
fn radix_b32_n092() {
    assert_eq!(radix_string(92u64, 32u64), "2s");
}

#[test]
fn radix_b32_n093() {
    assert_eq!(radix_string(93u64, 32u64), "2t");
}

#[test]
fn radix_b32_n094() {
    assert_eq!(radix_string(94u64, 32u64), "2u");
}

#[test]
fn radix_b32_n095() {
    assert_eq!(radix_string(95u64, 32u64), "2v");
}

#[test]
fn radix_b32_n096() {
    assert_eq!(radix_string(96u64, 32u64), "30");
}

#[test]
fn radix_b32_n097() {
    assert_eq!(radix_string(97u64, 32u64), "31");
}

#[test]
fn radix_b32_n098() {
    assert_eq!(radix_string(98u64, 32u64), "32");
}

#[test]
fn radix_b32_n099() {
    assert_eq!(radix_string(99u64, 32u64), "33");
}

#[test]
fn radix_b32_n100() {
    assert_eq!(radix_string(100u64, 32u64), "34");
}

#[test]
fn radix_b32_n101() {
    assert_eq!(radix_string(101u64, 32u64), "35");
}

#[test]
fn radix_b32_n102() {
    assert_eq!(radix_string(102u64, 32u64), "36");
}

#[test]
fn radix_b32_n103() {
    assert_eq!(radix_string(103u64, 32u64), "37");
}

#[test]
fn radix_b32_n104() {
    assert_eq!(radix_string(104u64, 32u64), "38");
}

#[test]
fn radix_b32_n105() {
    assert_eq!(radix_string(105u64, 32u64), "39");
}

#[test]
fn radix_b32_n106() {
    assert_eq!(radix_string(106u64, 32u64), "3a");
}

#[test]
fn radix_b32_n107() {
    assert_eq!(radix_string(107u64, 32u64), "3b");
}

#[test]
fn radix_b32_n108() {
    assert_eq!(radix_string(108u64, 32u64), "3c");
}

#[test]
fn radix_b32_n109() {
    assert_eq!(radix_string(109u64, 32u64), "3d");
}

#[test]
fn radix_b32_n110() {
    assert_eq!(radix_string(110u64, 32u64), "3e");
}

#[test]
fn radix_b32_n111() {
    assert_eq!(radix_string(111u64, 32u64), "3f");
}

#[test]
fn radix_b32_n112() {
    assert_eq!(radix_string(112u64, 32u64), "3g");
}

#[test]
fn radix_b32_n113() {
    assert_eq!(radix_string(113u64, 32u64), "3h");
}

#[test]
fn radix_b32_n114() {
    assert_eq!(radix_string(114u64, 32u64), "3i");
}

#[test]
fn radix_b32_n115() {
    assert_eq!(radix_string(115u64, 32u64), "3j");
}

#[test]
fn radix_b32_n116() {
    assert_eq!(radix_string(116u64, 32u64), "3k");
}

#[test]
fn radix_b32_n117() {
    assert_eq!(radix_string(117u64, 32u64), "3l");
}

#[test]
fn radix_b32_n118() {
    assert_eq!(radix_string(118u64, 32u64), "3m");
}

#[test]
fn radix_b32_n119() {
    assert_eq!(radix_string(119u64, 32u64), "3n");
}

#[test]
fn radix_b36_n000() {
    assert_eq!(radix_string(0u64, 36u64), "0");
}

#[test]
fn radix_b36_n001() {
    assert_eq!(radix_string(1u64, 36u64), "1");
}

#[test]
fn radix_b36_n002() {
    assert_eq!(radix_string(2u64, 36u64), "2");
}

#[test]
fn radix_b36_n003() {
    assert_eq!(radix_string(3u64, 36u64), "3");
}

#[test]
fn radix_b36_n004() {
    assert_eq!(radix_string(4u64, 36u64), "4");
}

#[test]
fn radix_b36_n005() {
    assert_eq!(radix_string(5u64, 36u64), "5");
}

#[test]
fn radix_b36_n006() {
    assert_eq!(radix_string(6u64, 36u64), "6");
}

#[test]
fn radix_b36_n007() {
    assert_eq!(radix_string(7u64, 36u64), "7");
}

#[test]
fn radix_b36_n008() {
    assert_eq!(radix_string(8u64, 36u64), "8");
}

#[test]
fn radix_b36_n009() {
    assert_eq!(radix_string(9u64, 36u64), "9");
}

#[test]
fn radix_b36_n010() {
    assert_eq!(radix_string(10u64, 36u64), "a");
}

#[test]
fn radix_b36_n011() {
    assert_eq!(radix_string(11u64, 36u64), "b");
}

#[test]
fn radix_b36_n012() {
    assert_eq!(radix_string(12u64, 36u64), "c");
}

#[test]
fn radix_b36_n013() {
    assert_eq!(radix_string(13u64, 36u64), "d");
}

#[test]
fn radix_b36_n014() {
    assert_eq!(radix_string(14u64, 36u64), "e");
}

#[test]
fn radix_b36_n015() {
    assert_eq!(radix_string(15u64, 36u64), "f");
}

#[test]
fn radix_b36_n016() {
    assert_eq!(radix_string(16u64, 36u64), "g");
}

#[test]
fn radix_b36_n017() {
    assert_eq!(radix_string(17u64, 36u64), "h");
}

#[test]
fn radix_b36_n018() {
    assert_eq!(radix_string(18u64, 36u64), "i");
}

#[test]
fn radix_b36_n019() {
    assert_eq!(radix_string(19u64, 36u64), "j");
}

#[test]
fn radix_b36_n020() {
    assert_eq!(radix_string(20u64, 36u64), "k");
}

#[test]
fn radix_b36_n021() {
    assert_eq!(radix_string(21u64, 36u64), "l");
}

#[test]
fn radix_b36_n022() {
    assert_eq!(radix_string(22u64, 36u64), "m");
}

#[test]
fn radix_b36_n023() {
    assert_eq!(radix_string(23u64, 36u64), "n");
}

#[test]
fn radix_b36_n024() {
    assert_eq!(radix_string(24u64, 36u64), "o");
}

#[test]
fn radix_b36_n025() {
    assert_eq!(radix_string(25u64, 36u64), "p");
}

#[test]
fn radix_b36_n026() {
    assert_eq!(radix_string(26u64, 36u64), "q");
}

#[test]
fn radix_b36_n027() {
    assert_eq!(radix_string(27u64, 36u64), "r");
}

#[test]
fn radix_b36_n028() {
    assert_eq!(radix_string(28u64, 36u64), "s");
}

#[test]
fn radix_b36_n029() {
    assert_eq!(radix_string(29u64, 36u64), "t");
}

#[test]
fn radix_b36_n030() {
    assert_eq!(radix_string(30u64, 36u64), "u");
}

#[test]
fn radix_b36_n031() {
    assert_eq!(radix_string(31u64, 36u64), "v");
}

#[test]
fn radix_b36_n032() {
    assert_eq!(radix_string(32u64, 36u64), "w");
}

#[test]
fn radix_b36_n033() {
    assert_eq!(radix_string(33u64, 36u64), "x");
}

#[test]
fn radix_b36_n034() {
    assert_eq!(radix_string(34u64, 36u64), "y");
}

#[test]
fn radix_b36_n035() {
    assert_eq!(radix_string(35u64, 36u64), "z");
}

#[test]
fn radix_b36_n036() {
    assert_eq!(radix_string(36u64, 36u64), "10");
}

#[test]
fn radix_b36_n037() {
    assert_eq!(radix_string(37u64, 36u64), "11");
}

#[test]
fn radix_b36_n038() {
    assert_eq!(radix_string(38u64, 36u64), "12");
}

#[test]
fn radix_b36_n039() {
    assert_eq!(radix_string(39u64, 36u64), "13");
}

#[test]
fn radix_b36_n040() {
    assert_eq!(radix_string(40u64, 36u64), "14");
}

#[test]
fn radix_b36_n041() {
    assert_eq!(radix_string(41u64, 36u64), "15");
}

#[test]
fn radix_b36_n042() {
    assert_eq!(radix_string(42u64, 36u64), "16");
}

#[test]
fn radix_b36_n043() {
    assert_eq!(radix_string(43u64, 36u64), "17");
}

#[test]
fn radix_b36_n044() {
    assert_eq!(radix_string(44u64, 36u64), "18");
}

#[test]
fn radix_b36_n045() {
    assert_eq!(radix_string(45u64, 36u64), "19");
}

#[test]
fn radix_b36_n046() {
    assert_eq!(radix_string(46u64, 36u64), "1a");
}

#[test]
fn radix_b36_n047() {
    assert_eq!(radix_string(47u64, 36u64), "1b");
}

#[test]
fn radix_b36_n048() {
    assert_eq!(radix_string(48u64, 36u64), "1c");
}

#[test]
fn radix_b36_n049() {
    assert_eq!(radix_string(49u64, 36u64), "1d");
}

#[test]
fn radix_b36_n050() {
    assert_eq!(radix_string(50u64, 36u64), "1e");
}

#[test]
fn radix_b36_n051() {
    assert_eq!(radix_string(51u64, 36u64), "1f");
}

#[test]
fn radix_b36_n052() {
    assert_eq!(radix_string(52u64, 36u64), "1g");
}

#[test]
fn radix_b36_n053() {
    assert_eq!(radix_string(53u64, 36u64), "1h");
}

#[test]
fn radix_b36_n054() {
    assert_eq!(radix_string(54u64, 36u64), "1i");
}

#[test]
fn radix_b36_n055() {
    assert_eq!(radix_string(55u64, 36u64), "1j");
}

#[test]
fn radix_b36_n056() {
    assert_eq!(radix_string(56u64, 36u64), "1k");
}

#[test]
fn radix_b36_n057() {
    assert_eq!(radix_string(57u64, 36u64), "1l");
}

#[test]
fn radix_b36_n058() {
    assert_eq!(radix_string(58u64, 36u64), "1m");
}

#[test]
fn radix_b36_n059() {
    assert_eq!(radix_string(59u64, 36u64), "1n");
}

#[test]
fn radix_b36_n060() {
    assert_eq!(radix_string(60u64, 36u64), "1o");
}

#[test]
fn radix_b36_n061() {
    assert_eq!(radix_string(61u64, 36u64), "1p");
}

#[test]
fn radix_b36_n062() {
    assert_eq!(radix_string(62u64, 36u64), "1q");
}

#[test]
fn radix_b36_n063() {
    assert_eq!(radix_string(63u64, 36u64), "1r");
}

#[test]
fn radix_b36_n064() {
    assert_eq!(radix_string(64u64, 36u64), "1s");
}

#[test]
fn radix_b36_n065() {
    assert_eq!(radix_string(65u64, 36u64), "1t");
}

#[test]
fn radix_b36_n066() {
    assert_eq!(radix_string(66u64, 36u64), "1u");
}

#[test]
fn radix_b36_n067() {
    assert_eq!(radix_string(67u64, 36u64), "1v");
}

#[test]
fn radix_b36_n068() {
    assert_eq!(radix_string(68u64, 36u64), "1w");
}

#[test]
fn radix_b36_n069() {
    assert_eq!(radix_string(69u64, 36u64), "1x");
}

#[test]
fn radix_b36_n070() {
    assert_eq!(radix_string(70u64, 36u64), "1y");
}

#[test]
fn radix_b36_n071() {
    assert_eq!(radix_string(71u64, 36u64), "1z");
}

#[test]
fn radix_b36_n072() {
    assert_eq!(radix_string(72u64, 36u64), "20");
}

#[test]
fn radix_b36_n073() {
    assert_eq!(radix_string(73u64, 36u64), "21");
}

#[test]
fn radix_b36_n074() {
    assert_eq!(radix_string(74u64, 36u64), "22");
}

#[test]
fn radix_b36_n075() {
    assert_eq!(radix_string(75u64, 36u64), "23");
}

#[test]
fn radix_b36_n076() {
    assert_eq!(radix_string(76u64, 36u64), "24");
}

#[test]
fn radix_b36_n077() {
    assert_eq!(radix_string(77u64, 36u64), "25");
}

#[test]
fn radix_b36_n078() {
    assert_eq!(radix_string(78u64, 36u64), "26");
}

#[test]
fn radix_b36_n079() {
    assert_eq!(radix_string(79u64, 36u64), "27");
}

#[test]
fn radix_b36_n080() {
    assert_eq!(radix_string(80u64, 36u64), "28");
}

#[test]
fn radix_b36_n081() {
    assert_eq!(radix_string(81u64, 36u64), "29");
}

#[test]
fn radix_b36_n082() {
    assert_eq!(radix_string(82u64, 36u64), "2a");
}

#[test]
fn radix_b36_n083() {
    assert_eq!(radix_string(83u64, 36u64), "2b");
}

#[test]
fn radix_b36_n084() {
    assert_eq!(radix_string(84u64, 36u64), "2c");
}

#[test]
fn radix_b36_n085() {
    assert_eq!(radix_string(85u64, 36u64), "2d");
}

#[test]
fn radix_b36_n086() {
    assert_eq!(radix_string(86u64, 36u64), "2e");
}

#[test]
fn radix_b36_n087() {
    assert_eq!(radix_string(87u64, 36u64), "2f");
}

#[test]
fn radix_b36_n088() {
    assert_eq!(radix_string(88u64, 36u64), "2g");
}

#[test]
fn radix_b36_n089() {
    assert_eq!(radix_string(89u64, 36u64), "2h");
}

#[test]
fn radix_b36_n090() {
    assert_eq!(radix_string(90u64, 36u64), "2i");
}

#[test]
fn radix_b36_n091() {
    assert_eq!(radix_string(91u64, 36u64), "2j");
}

#[test]
fn radix_b36_n092() {
    assert_eq!(radix_string(92u64, 36u64), "2k");
}

#[test]
fn radix_b36_n093() {
    assert_eq!(radix_string(93u64, 36u64), "2l");
}

#[test]
fn radix_b36_n094() {
    assert_eq!(radix_string(94u64, 36u64), "2m");
}

#[test]
fn radix_b36_n095() {
    assert_eq!(radix_string(95u64, 36u64), "2n");
}

#[test]
fn radix_b36_n096() {
    assert_eq!(radix_string(96u64, 36u64), "2o");
}

#[test]
fn radix_b36_n097() {
    assert_eq!(radix_string(97u64, 36u64), "2p");
}

#[test]
fn radix_b36_n098() {
    assert_eq!(radix_string(98u64, 36u64), "2q");
}

#[test]
fn radix_b36_n099() {
    assert_eq!(radix_string(99u64, 36u64), "2r");
}

#[test]
fn radix_b36_n100() {
    assert_eq!(radix_string(100u64, 36u64), "2s");
}

#[test]
fn radix_b36_n101() {
    assert_eq!(radix_string(101u64, 36u64), "2t");
}

#[test]
fn radix_b36_n102() {
    assert_eq!(radix_string(102u64, 36u64), "2u");
}

#[test]
fn radix_b36_n103() {
    assert_eq!(radix_string(103u64, 36u64), "2v");
}

#[test]
fn radix_b36_n104() {
    assert_eq!(radix_string(104u64, 36u64), "2w");
}

#[test]
fn radix_b36_n105() {
    assert_eq!(radix_string(105u64, 36u64), "2x");
}

#[test]
fn radix_b36_n106() {
    assert_eq!(radix_string(106u64, 36u64), "2y");
}

#[test]
fn radix_b36_n107() {
    assert_eq!(radix_string(107u64, 36u64), "2z");
}

#[test]
fn radix_b36_n108() {
    assert_eq!(radix_string(108u64, 36u64), "30");
}

#[test]
fn radix_b36_n109() {
    assert_eq!(radix_string(109u64, 36u64), "31");
}

#[test]
fn radix_b36_n110() {
    assert_eq!(radix_string(110u64, 36u64), "32");
}

#[test]
fn radix_b36_n111() {
    assert_eq!(radix_string(111u64, 36u64), "33");
}

#[test]
fn radix_b36_n112() {
    assert_eq!(radix_string(112u64, 36u64), "34");
}

#[test]
fn radix_b36_n113() {
    assert_eq!(radix_string(113u64, 36u64), "35");
}

#[test]
fn radix_b36_n114() {
    assert_eq!(radix_string(114u64, 36u64), "36");
}

#[test]
fn radix_b36_n115() {
    assert_eq!(radix_string(115u64, 36u64), "37");
}

#[test]
fn radix_b36_n116() {
    assert_eq!(radix_string(116u64, 36u64), "38");
}

#[test]
fn radix_b36_n117() {
    assert_eq!(radix_string(117u64, 36u64), "39");
}

#[test]
fn radix_b36_n118() {
    assert_eq!(radix_string(118u64, 36u64), "3a");
}

#[test]
fn radix_b36_n119() {
    assert_eq!(radix_string(119u64, 36u64), "3b");
}
