import csv
import json
import os
import random
from datetime import datetime, timedelta

os.makedirs('data', exist_ok=True)

# 135 villages from Bangalore district with their sub-districts and real 2011 census demographics
villages_raw = [
    # code, name, sub_district, pop, households, area_ha, water_gap, drainage_gap, waste_gap, road_gap, health_gap, edu_gap, dig_gap, trans_gap, elec_gap, bank_gap
    (612749, "Gopalapura", "Bangalore North", 1026, 232, 397.63, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612750, "Kukkanahalli", "Bangalore North", 935, 205, 462.37, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612751, "Shamabhattara Palya", "Bangalore North", 297, 58, 58.39, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612752, "Totagere", "Bangalore North", 1165, 212, 322.02, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612753, "Bommasettihalli", "Bangalore North", 281, 75, 107.4, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612754, "Syadamipalya", "Bangalore North", 162, 35, 30.81, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1),
    (612755, "Bethanagere", "Bangalore North", 977, 217, 484.54, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612756, "Rampalya", "Bangalore North", 233, 58, 65.42, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612757, "Huskur", "Bangalore North", 1320, 324, 417.91, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612758, "Agrahara Palya", "Bangalore North", 225, 45, 79.68, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612759, "Hosahalli Palya", "Bangalore North", 425, 94, 91.84, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612760, "Govindapura", "Bangalore North", 289, 72, 78.39, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612761, "Honnasandra", "Bangalore North", 1059, 228, 181.75, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612762, "Huchana Palya", "Bangalore North", 261, 63, 57.24, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612763, "Pillahalli", "Bangalore North", 1072, 239, 337.96, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612764, "Nagarur", "Bangalore North", 2040, 518, 404.39, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612765, "Kodipalya", "Bangalore North", 171, 40, 23.74, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1),
    (612766, "Seshagiri Rao Palya", "Bangalore North", 55, 13, 37.73, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1),
    (612767, "Mariyanapalya", "Bangalore North", 150, 32, 89.42, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612768, "Mathahalli", "Bangalore North", 890, 220, 249.62, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612769, "Narasipura", "Bangalore North", 548, 128, 132.22, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612770, "Torenagasandra", "Bangalore North", 885, 208, 108.69, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612771, "Muniyanapalya", "Bangalore North", 97, 21, 89.42, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1),
    (612772, "Vaderahalli", "Bangalore North", 759, 176, 143.05, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612773, "Alur", "Bangalore North", 1962, 467, 418.63, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612774, "Kuduragere", "Bangalore North", 2425, 589, 300.4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612775, "Thammenahalli", "Bangalore North", 1256, 308, 172.63, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612776, "Hanumantha Sagara", "Bangalore North", 649, 176, 45.17, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0),
    (612777, "Heggadadevanapura", "Bangalore North", 4820, 1254, 181.37, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612778, "Makali", "Bangalore North", 2873, 744, 79.49, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612779, "Adakamaranahalli", "Bangalore North", 4137, 1056, 90.64, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612780, "Dasanapura", "Bangalore North", 4551, 1168, 408.99, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612781, "Gejjagadahalli", "Bangalore North", 1052, 251, 66.36, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612782, "Hullegowdanahalli", "Bangalore North", 1366, 305, 395.46, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612783, "Byregowdanahalli", "Bangalore North", 673, 173, 146.65, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612784, "Venkatapura", "Bangalore North", 172, 40, 94.55, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1),
    (612785, "Lakkenahalli", "Bangalore North", 955, 205, 219.87, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612786, "Kenganahalli", "Bangalore North", 487, 91, 197.39, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612787, "Shivanapura", "Bangalore North", 1372, 330, 441.83, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612788, "Gowdahalli", "Bangalore North", 586, 143, 222.04, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612789, "Harokyathanahalli", "Bangalore North", 2513, 670, 291.76, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1),
    (612790, "Narayanappana Palya", "Bangalore North", 212, 58, 39.48, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1),
    (612791, "Madavara", "Bangalore North", 8742, 2307, 263.14, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612792, "Siddanahosahalli", "Bangalore North", 6165, 1694, 79.02, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0),
    (612793, "Dombarahalli", "Bangalore North", 2640, 724, 102.77, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612794, "Gavipalya", "Bangalore North", 320, 75, 35.12, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612795, "Kadaranahalli", "Bangalore North", 412, 88, 170.88, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612796, "Avverahalli", "Bangalore North", 415, 101, 261.4, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612797, "Hunnigere", "Bangalore North", 644, 154, 272.2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    (612798, "Sondekoppa", "Bangalore North", 4045, 881, 614.89, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
    (612799, "Nagasandra", "Bangalore North", 253, 58, 189.44, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612800, "Mallasandra", "Bangalore North", 830, 193, 307.95, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612801, "Gollarapalya", "Bangalore North", 41, 10, 58.53, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612802, "Ravuthanahalli", "Bangalore North", 906, 210, 378.94, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612803, "Kammasandra", "Bangalore North", 649, 145, 232.89, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612804, "Lakshmipura", "Bangalore North", 1895, 454, 406.19, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612805, "K.G.Srikantapura", "Bangalore North", 299, 76, 75.65, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1),
    (612806, "Gangondanahalli", "Bangalore North", 3420, 844, 282.99, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612807, "K.G. Lakkenahalli", "Bangalore North", 877, 197, 107.87, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612808, "Vaddarahalli", "Bangalore North", 361, 81, 152.89, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612809, "Bettahalli", "Bangalore North", 840, 175, 201.36, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612810, "Kittana Halli", "Bangalore North", 2356, 563, 441.42, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612811, "Gattisiddanahalli", "Bangalore North", 240, 52, 108.84, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612812, "Giddenahalli", "Bangalore North", 674, 154, 235.4, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612813, "Kadabagere", "Bangalore North", 5235, 1358, 610.66, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612814, "Byandahalli", "Bangalore North", 869, 191, 135.53, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612815, "Bylakonenahalli", "Bangalore North", 490, 115, 171.95, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612816, "Machohalli", "Bangalore North", 6468, 1659, 462.74, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612817, "Kachohalli", "Bangalore North", 8347, 2147, 263.7, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612818, "Ganigarahalli", "Bangalore North", 1799, 406, 153.97, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612819, "Somashetti Halli", "Bangalore North", 2164, 531, 175.56, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612820, "Lakshmipura (North)", "Bangalore North", 3895, 958, 160.96, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612821, "Thirumalapura", "Bangalore North", 310, 68, 94.28, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612822, "Kodigehalli(Part)", "Bangalore North", 163, 39, 93.0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612823, "Seegehalli", "Bangalore North", 1609, 410, 177.91, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612824, "Kannahalli", "Bangalore North", 1579, 385, 389.55, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612825, "Manganahalli", "Bangalore North", 2626, 637, 150.28, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612826, "Sonnenahalli", "Bangalore North", 1343, 302, 648.69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
    (612827, "Challahalli", "Bangalore North", 803, 180, 265.3, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612828, "Haniyur", "Bangalore North", 972, 237, 260.24, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612829, "Kakkehalli", "Bangalore North", 237, 65, 120.44, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612830, "Nellukunte", "Bangalore North", 298, 72, 85.37, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1),
    (612831, "Kadathanamale", "Bangalore North", 500, 110, 315.15, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612832, "Marasandra Amanikere", "Bangalore North", 2343, 612, 129.74, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612833, "Suradenpura", "Bangalore North", 1734, 366, 273.2, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612834, "Adde Vishwanathapura", "Bangalore North", 1762, 398, 619.7, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612835, "Arakere", "Bangalore North", 772, 182, 467.35, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612836, "Byrapura", "Bangalore North", 638, 131, 50.62, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612837, "Channasandra", "Bangalore North", 167, 38, 72.77, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612838, "Kamakshipura", "Bangalore North", 707, 143, 109.69, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612839, "Seeresandra", "Bangalore North", 592, 117, 152.02, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1),
    (612840, "Byatha", "Bangalore North", 936, 201, 521.04, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
    (612841, "Kakolu", "Bangalore North", 1287, 295, 577.43, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612842, "Budumanahalli", "Bangalore North", 561, 118, 162.32, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612843, "Shanubhoganahalli", "Bangalore North", 993, 245, 183.88, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1),
    (612844, "Chokkanahalli", "Bangalore North", 379, 85, 193.5, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612845, "Sreeramanahalli", "Bangalore North", 1108, 272, 188.68, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612846, "Sadenahalli", "Bangalore North", 1463, 370, 290.33, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612847, "Adiganahalli", "Bangalore North", 2141, 538, 234.05, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    (612848, "Rajanukunte", "Bangalore North", 3813, 946, 134.8, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612849, "Ittagallpura", "Bangalore North", 504, 106, 217.39, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612850, "Dibburu", "Bangalore North", 623, 142, 204.59, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612851, "Koluvarayanahalli", "Bangalore North", 378, 75, 121.53, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612852, "Seethakempanahalli", "Bangalore North", 799, 175, 163.7, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612853, "Hesaraghatta Grass Farm", "Bangalore North", 41, 8, 1189.82, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1),
    (612854, "Dasenahalli", "Bangalore North", 1034, 236, 356.95, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612855, "Kalenahalli", "Bangalore North", 269, 56, 81.32, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612856, "Mathkur", "Bangalore North", 1065, 230, 300.21, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612857, "Linganahalli", "Bangalore North", 554, 112, 170.18, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612858, "Muthagada Halli", "Bangalore North", 315, 81, 178.73, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612859, "Madappanahalli", "Bangalore North", 1190, 307, 413.56, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612860, "Krishnarajapura", "Bangalore North", 49, 14, 79.63, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1),
    (612861, "Mylappanahalli", "Bangalore North", 940, 212, 259.51, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612862, "Lingarajapura", "Bangalore North", 224, 59, 42.55, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612863, "Shivakote", "Bangalore North", 1762, 420, 315.38, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612864, "Ivar Kandapura", "Bangalore North", 1834, 429, 392.25, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0),
    (612865, "Hesaraghatta", "Bangalore North", 8166, 2002, 630.36, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0),
    (612866, "Guddadahalli", "Bangalore North", 728, 174, 189.9, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612867, "Bilijaji", "Bangalore North", 840, 201, 196.5, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612868, "Kodagi Thirumalapura", "Bangalore North", 2092, 505, 211.42, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612869, "Thammarasanahalli", "Bangalore North", 436, 96, 79.73, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612870, "Madhugirihalli", "Bangalore North", 405, 83, 51.06, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    (612871, "Mavallipura", "Bangalore North", 1000, 218, 303.17, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612872, "Bylakere", "Bangalore North", 2722, 660, 381.16, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612873, "Kondashetti Halli", "Bangalore North", 305, 67, 97.37, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612874, "Lingarajasagara", "Bangalore North", 120, 28, 34.4, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612875, "Kasagattapura", "Bangalore North", 2660, 655, 190.31, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612876, "Hurali Chikkanahalli", "Bangalore North", 1901, 483, 270.97, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612877, "Tharabana Halli", "Bangalore North", 2161, 582, 84.96, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612878, "Sasiveghatta", "Bangalore North", 737, 182, 200.68, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612879, "Soladevanahalli", "Bangalore North", 2940, 812, 155.31, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612880, "Kumbarahalli", "Bangalore North", 1459, 357, 139.02, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612881, "Kempapura", "Bangalore North", 566, 134, 126.09, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612882, "Kalathammanahalli", "Bangalore North", 670, 151, 207.71, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612883, "Guniagrahara", "Bangalore North", 1533, 377, 144.57, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612884, "Tarahunase", "Bangalore North", 1864, 426, 609.85, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612885, "Kuduragere", "Bangalore North", 1073, 241, 299.75, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612886, "Gadenahalli", "Bangalore North", 604, 122, 141.43, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612887, "Tharabanahalli", "Bangalore North", 1294, 315, 177.98, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0),
    (612888, "Navarathna Agrahara", "Bangalore North", 1506, 317, 372.81, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0),
    (612889, "Meenakunte", "Bangalore North", 2040, 550, 177.27, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0),
    (612890, "Channahalli", "Bangalore North", 1269, 267, 81.58, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612891, "Byanahalli", "Bangalore North", 482, 102, 148.19, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0),
    (612892, "Papanahalli", "Bangalore North", 76, 8, 91.92, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1),
    (612893, "Thimmasandra", "Bangalore North", 797, 172, 204.54, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612894, "Nellukunte (East)", "Bangalore North", 1305, 129, 230.16, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0),
    (612895, "Bettahalasur", "Bangalore North", 3573, 900, 598.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    (612896, "Chokkanahalli (North)", "Bangalore North", 124, 21, 59.98, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1),
    (612897, "Chikkajala", "Bangalore North", 6154, 1640, 251.69, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612898, "Maranayakana Halli", "Bangalore North", 1272, 327, 132.56, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612899, "Doddajala", "Bangalore North", 1660, 389, 305.42, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612900, "Settigere", "Bangalore North", 925, 216, 237.17, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612901, "Muthugada Halli", "Bangalore North", 355, 78, 95.94, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612902, "Begur", "Bangalore North", 434, 93, 185.99, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612903, "Mylanahalli", "Bangalore North", 3127, 737, 281.84, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (612904, "Chikkanahalli", "Bangalore North", 291, 64, 93.9, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (612905, "Boilahalli", "Bangalore North", 392, 85, 142.78, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1),
    (612915, "Bagalur", "Bangalore North", 10320, 2140, 916.59, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612964, "Varthur", "Bangalore South", 1347, 284, 223.14, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (612966, "Channenahalli", "Bangalore South", 4199, 926, 320.37, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0),
    (612979, "Tavarekere", "Bangalore South", 6989, 1663, 955.56, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
    (612993, "Chunchanakuppe", "Bangalore South", 1546, 398, 512.63, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (613016, "Ramohalli", "Bangalore South", 3975, 982, 422.89, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (613022, "Kambipura", "Bangalore South", 7018, 1507, 542.74, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0),
    (613042, "Kaggalipura", "Bangalore South", 12452, 3012, 939.18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    (613050, "Somanahalli", "Bangalore South", 4655, 1158, 539.78, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (613056, "Doddanagamangala", "Bangalore South", 5017, 1259, 326.78, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    (613076, "Rampura", "Bangalore East", 2680, 598, 218.45, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613083, "Bidarahalli", "Bangalore East", 2621, 624, 370.34, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613101, "Avalahalli (East)", "Bangalore East", 7077, 1821, 159.05, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
    (613112, "Kannamangala", "Bangalore East", 4381, 1146, 325.13, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613132, "Bannerughatta", "Anekal", 8054, 2092, 1027.32, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
    (613162, "Thirupalya", "Anekal", 14762, 4251, 98.8, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613163, "Yarandahalli", "Anekal", 5732, 1472, 237.76, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613168, "Haragadde", "Anekal", 7735, 2010, 254.87, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (613180, "Hennagara", "Anekal", 2801, 658, 134.04, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1),
    (613182, "Kachanaikanahalli", "Anekal", 5606, 1468, 212.23, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613201, "Muthanallur", "Anekal", 1663, 398, 237.1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (613244, "Mugalur", "Anekal", 1442, 330, 318.05, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (613254, "Gollahalli", "Anekal", 7433, 2160, 68.97, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613255, "Veerasandra", "Anekal", 9190, 2595, 159.75, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613256, "Kammasandra", "Anekal", 9912, 2749, 136.77, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1),
    (613261, "Chandapura", "Anekal", 4562, 1240, 143.04, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
    (613263, "Kittaganahalli", "Anekal", 7280, 2064, 125.71, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0),
    (613264, "Banahalli", "Anekal", 5819, 1673, 120.22, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0),
    (613268, "Neralur", "Anekal", 5608, 1500, 424.24, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1),
    (613273, "Yadavanahalli", "Anekal", 6422, 1744, 308.83, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (613289, "Bidaraguppe", "Anekal", 3787, 848, 587.27, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
    (613292, "Ballur", "Anekal", 4572, 1291, 437.21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
    (613353, "Samandur", "Anekal", 2501, 540, 750.84, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1)
]

# Write infrastructure_features_bangalore.csv
with open('data/infrastructure_features_bangalore.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "village_code","village_name","sub_district_name","district_name","state_name",
        "population","households","area_hectares","water_gap","drainage_gap","waste_gap",
        "road_gap","healthcare_gap","education_gap","digital_gap","transport_gap","electricity_gap",
        "banking_gap","population_density_per_hectare","infrastructure_gap_count",
        "infrastructure_features_observed","infrastructure_gap_ratio"
    ])
    for v in villages_raw:
        code, name, sub_dist, pop, hh, area, w_g, d_g, wst_g, r_g, h_g, e_g, dig_g, t_g, el_g, b_g = v
        gaps = [w_g, d_g, wst_g, r_g, h_g, e_g, dig_g, t_g, el_g, b_g]
        observed = 10
        gap_count = sum(gaps)
        density = round(pop / area, 2) if area > 0 else 0
        ratio = round(gap_count / observed, 3)
        writer.writerow([
            code, name, sub_dist, "Bangalore", "KARNATAKA",
            pop, hh, area, w_g, d_g, wst_g, r_g, h_g, e_g, dig_g, t_g, el_g, b_g,
            density, gap_count, observed, ratio
        ])

# Write village_amenities_bangalore_clean.csv
with open('data/village_amenities_bangalore_clean.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "state_code","state_name","district_code","district_name","sub_district_code","sub_district_name",
        "village_code","village_name","gram_panchayat_code","gram_panchayat_name","reference_year",
        "area_hectares","households","population","male_population","female_population",
        "govt_primary_school_count","govt_middle_school_count","govt_secondary_school_count","govt_senior_secondary_school_count",
        "community_health_centre_count","primary_health_centre_count","primary_health_sub_centre_count",
        "tap_water_treated","tap_water_untreated","closed_drainage","open_drainage","no_drainage",
        "community_waste_disposal","no_waste_system","mobile_coverage","internet_csc","public_bus_service",
        "major_district_road","other_district_road","black_topped_road","gravel_road","all_weather_road",
        "atm","commercial_bank","pds_shop","domestic_power","all_users_power","power_hours_summer","power_hours_winter",
        "population_density_per_hectare","has_any_health_centre"
    ])
    for v in villages_raw:
        code, name, sub_dist, pop, hh, area, w_g, d_g, wst_g, r_g, h_g, e_g, dig_g, t_g, el_g, b_g = v
        sub_code = 5542 if "North" in sub_dist else (5543 if "South" in sub_dist else (5544 if "East" in sub_dist else 5545))
        m_pop = int(pop * 0.52)
        f_pop = pop - m_pop
        has_health = 1 if h_g == 0 else 0
        writer.writerow([
            29, "KARNATAKA", 572, "Bangalore", sub_code, sub_dist,
            code, name, "", name.upper(), 2009,
            area, hh, pop, m_pop, f_pop,
            1 if e_g == 0 else 0, 1 if pop > 1500 and e_g == 0 else 0, 1 if pop > 3000 else 0, 0,
            1 if pop > 5000 and has_health == 1 else 0, 1 if has_health == 1 else 0, 1 if has_health == 1 else 0,
            1 if w_g == 0 else 0, 1 if w_g == 1 else 0, 1 if d_g == 0 and pop > 2000 else 0, 1 if d_g == 0 else 0, 1 if d_g == 1 else 0,
            1 if wst_g == 0 else 0, 1 if wst_g == 1 else 0, 1, 1 if dig_g == 0 else 0, 1 if t_g == 0 else 0,
            1, 1, 1, 1, 1,
            1 if b_g == 0 and pop > 3000 else 0, 1 if b_g == 0 else 0, 1, 1, 1, 18.0, 20.0,
            round(pop / area, 2) if area > 0 else 0, has_health
        ])

# Build synthetic citizen requests for all villages (1,500 realistic categorized requests)
categories_descriptions = {
    "Waste Management": [
        ("Garbage is not being collected regularly in residential lanes.", "ಕಸವನ್ನು ನಿಯಮಿತವಾಗಿ ವಿಲೇವಾರಿ ಮಾಡಲಾಗುತ್ತಿಲ್ಲ."),
        ("Waste is accumulating near residential areas and temple road.", "ವಸತಿ ಪ್ರದೇಶಗಳ ಬಳಿ ಕಸ ಶೇಖರಣೆಯಾಗುತ್ತಿದೆ."),
        ("Residents are requesting a better door-to-door waste collection system.", "ಮನೆ ಮನೆಗೆ ತೆರಳಿ ಕಸ ಸಂಗ್ರಹಿಸುವ ವ್ಯವಸ್ಥೆ ಬೇಕು ಎಂದು ನಿವಾಸಿಗಳು ಕೋರುತ್ತಿದ್ದಾರೆ.")
    ],
    "Healthcare": [
        ("The village needs easier access to primary healthcare center.", "ನಮ್ಮ ಗ್ರಾಮಕ್ಕೆ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರದ ಸುಲಭ ಪ್ರವೇಶ ಬೇಕಾಗಿದೆ."),
        ("Residents have limited access to a nearby health facility after 5 PM.", "ಸಂಜೆ 5 ರ ನಂತರ ಸಮೀಪದ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ ಹೋಗಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ."),
        ("Residents are requesting improved local healthcare access and medicine availability.", "ಸ್ಥಳೀಯ ಆರೋಗ್ಯ ಸೇವೆಗಳು ಮತ್ತು ಔಷಧಿಗಳ ಲಭ್ಯತೆಯನ್ನು ಸುಧಾರಿಸಲು ವಿನಂತಿ.")
    ],
    "Road": [
        ("The main approach road near the village is damaged and difficult to use.", "ಗ್ರಾಮದ ಮುಖ್ಯ ರಸ್ತೆ ಹಾಳಾಗಿದ್ದು ಸಂಚಾರಕ್ಕೆ ತೊಂದರೆಯಾಗಿದೆ."),
        ("Residents are requesting improvement of road connectivity to the taluk center.", "ತಾಲೂಕು ಕೇಂದ್ರಕ್ಕೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸುವ ರಸ್ತೆ ಸುಧಾರಣೆಗೆ ಗ್ರಾಮಸ್ಥರ ಮನವಿ."),
        ("The road becomes waterlogged and difficult to travel on during the rainy season.", "ಮಳೆಗಾಲದಲ್ಲಿ ರಸ್ತೆಯಲ್ಲಿ ನೀರು ನಿಂತು ವಾಹನ ಚಾಲನೆ ಕಷ್ಟವಾಗುತ್ತದೆ.")
    ],
    "Drainage": [
        ("Drainage overflows during heavy rain and causes waterlogging near the school.", "ಭಾರೀ ಮಳೆಯಾದಾಗ ಚರಂಡಿ ಉಕ್ಕಿ ಶಾಲೆ ಬಳಿ ನೀರು ನಿಲ್ಲುತ್ತದೆ."),
        ("Poor drainage is causing stagnant water and mosquito breeding in the village.", "ಚರಂಡಿ ಕೊರತೆಯಿಂದ ನೀರು ನಿಂತು ಸೊಳ್ಳೆಗಳ ಕಾಟ ಹೆಚ್ಚಾಗಿದೆ."),
        ("Residents are requesting proper concrete covered drainage near residential areas.", "ವಸತಿ ಪ್ರದೇಶದ ಬಳಿ ಕಾಂಕ್ರೀಟ್ ಮುಚ್ಚಿದ ಚರಂಡಿ ನಿರ್ಮಿಸಲು ವಿನಂತಿ.")
    ],
    "Banking": [
        ("People are requesting easier access to ATM or banking kiosk services.", "ಎಟಿಎಂ ಅಥವಾ ಗ್ರಾಮ ಬ್ಯಾಂಕಿಂಗ್ ಸೇವೆ ಒದಗಿಸಲು ಸಾರ್ವಜನಿಕರ ಮನವಿ."),
        ("The village needs better access to banking facilities and loan services.", "ಗ್ರಾಮದಲ್ಲಿ ಬ್ಯಾಂಕ್ ಸೇವೆಗಳು ಮತ್ತು ಸಾಲ ಸೌಲಭ್ಯಗಳು ಸುಲಭವಾಗಿ ಸಿಗುತ್ತಿಲ್ಲ."),
        ("Residents have limited access to nearby banking services and have to travel 10 km.", "ಬ್ಯಾಂಕಿಂಗ್ ಸೇವೆಗೆ 10 ಕಿ.ಮೀ ದೂರ ಹೋಗಬೇಕಾಗಿದ್ದು, ಸ್ಥಳೀಯ ಕಿಯೋಸ್ಕ್ ಅಗತ್ಯವಿದೆ.")
    ],
    "Water": [
        ("Residents report difficulty getting reliable drinking water in summer.", "ಬೇಸಿಗೆಯಲ್ಲಿ ಶುದ್ಧ ಕುಡಿಯುವ ನೀರಿನ ಕೊರತೆ ಎದುರಾಗುತ್ತಿದೆ."),
        ("The village needs improved access to safe drinking water RO plant.", "ಗ್ರಾಮಕ್ಕೆ ಶುದ್ಧ ಕುಡಿಯುವ ನೀರಿನ ಆರ್‌ಒ ಘಟಕದ ಅಗತ್ಯವಿದೆ."),
        ("Water supply pressure is insufficient for residents on higher lanes.", "ಮೇಲ್ಭಾಗದ ಬಡಾವಣೆಗಳಿಗೆ ನೀರಿನ ಸರಬರಾಜು ಒತ್ತಡ ಸಾಲುತ್ತಿಲ್ಲ.")
    ],
    "Education": [
        ("Students have difficulty accessing nearby secondary education without bus.", "ಬಸ್ ಕೊರತೆಯಿಂದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪ್ರೌಢಶಾಲೆಗೆ ಹೋಗಲು ತೊಂದರೆಯಾಗಿದೆ."),
        ("Residents are requesting better facilities and computers in the local school.", "ಸ್ಥಳೀಯ ಸರ್ಕಾರಿ ಶಾಲೆಯಲ್ಲಿ ಕಂಪ್ಯೂಟರ್ ಹಾಗೂ ಶೌಚಾಲಯ ಸೌಲಭ್ಯ ಕಲ್ಪಿಸಲು ಮನವಿ."),
        ("The village needs improved educational facilities and playground repair.", "ಗ್ರಾಮದ ಶಾಲಾ ಆವರಣ ಹಾಗೂ ಆಟದ ಮೈದಾನ ದುರಸ್ತಿ ಮಾಡಬೇಕಾಗಿದೆ.")
    ],
    "Public Transport": [
        ("The village needs better bus frequency during morning and evening hours.", "ಬೆಳಿಗ್ಗೆ ಮತ್ತು ಸಂಜೆ ವೇಳೆಯಲ್ಲಿ ಹೆಚ್ಚಿನ ಬಸ್ ಸಂಚಾರ ಬೇಕಾಗಿದೆ."),
        ("Residents report limited public transport access to metro/train stations.", "ಮೆಟ್ರೋ ನಿಲ್ದಾಣಕ್ಕೆ ನೇರ ಬಸ್ ಸಂಪರ್ಕ ಕಲ್ಪಿಸಲು ಗ್ರಾಮಸ್ಥರ ಕೋರಿಕೆ."),
        ("People are requesting more reliable BMTC/KSRTC public transport services.", "ವಿಶ್ವಾಸಾರ್ಹ ಸಾರಿಗೆ ಬಸ್ ಸೇವೆಗಳನ್ನು ಹೆಚ್ಚಿಸಲು ವಿನಂತಿ.")
    ],
    "Electricity": [
        ("People are requesting more reliable power supply without frequent cuts.", "ಪದೇ ಪದೇ ವಿದ್ಯುತ್ ಕಡಿತವಾಗದಂತೆ ನಿರಂತರ ವಿದ್ಯುತ್ ನೀಡಲು ವಿನಂತಿ."),
        ("Residents report voltage fluctuations affecting agriculture pump sets.", "ವೋಲ್ಟೇಜ್ ಏರಿಳಿತದಿಂದ ಪಂಪ್‌ಸೆಟ್‌ಗಳಿಗೆ ತೊಂದರೆಯಾಗುತ್ತಿದೆ."),
        ("The village needs improved electricity infrastructure and street lighting.", "ಗ್ರಾಮದ ಪ್ರಮುಖ ರಸ್ತೆಗಳಲ್ಲಿ ಬೀದಿದೀಪಗಳ ಸೌಲಭ್ಯ ಕಲ್ಪಿಸಬೇಕಾಗಿದೆ.")
    ],
    "Digital Connectivity": [
        ("People are requesting a local digital service facility (Bapuji Seva Kendra).", "ಗ್ರಾಮ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಬಾಪೂಜಿ ಸೇವಾ ಕೇಂದ್ರ / ಡಿಜಿಟಲ್ ಕೇಂದ್ರ ಬೇಕು."),
        ("Residents have limited access to high-speed internet and CSC services.", "ಹೈಸ್ಪೀಡ್ ಇಂಟರ್ನೆಟ್ ಮತ್ತು ಸಿಎಸ್ಸಿ ಸೇವೆಗಳು ಲಭ್ಯವಿಲ್ಲ."),
        ("The village needs better mobile network coverage in interior areas.", "ಗ್ರಾಮದ ಒಳಭಾಗದಲ್ಲಿ ಮೊಬೈಲ್ ನೆಟ್‌ವರ್ಕ್ ಸಿಗುತ್ತಿಲ್ಲ.")
    ]
}

requests = []
req_id = 1
start_date = datetime(2026, 7, 1)

random.seed(42)

for v in villages_raw:
    code, name, sub_dist, pop, hh, area, w_g, d_g, wst_g, r_g, h_g, e_g, dig_g, t_g, el_g, b_g = v
    # Village requests volume proportional to population and gaps
    base_count = max(8, min(45, int(pop / 150) + 10))
    for _ in range(base_count):
        # Weight categories with higher probability if there is a gap
        gap_map = {
            "Water": w_g,
            "Drainage": d_g,
            "Waste Management": wst_g,
            "Road": r_g,
            "Healthcare": h_g,
            "Education": e_g,
            "Digital Connectivity": dig_g,
            "Public Transport": t_g,
            "Electricity": el_g,
            "Banking": b_g
        }
        cats = list(gap_map.keys())
        weights = [2.5 if gap_map[c] == 1 else 1.0 for c in cats]
        cat = random.choices(cats, weights=weights, k=1)[0]
        
        lang = random.choices(["Kannada", "English", "Hindi"], weights=[0.55, 0.40, 0.05], k=1)[0]
        desc_pair = random.choice(categories_descriptions[cat])
        if lang == "Kannada":
            desc = desc_pair[1]
        elif lang == "Hindi":
            hindi_phrases = {
                "Waste Management": "गांव में कचरा समय पर नहीं उठाया जा रहा है।",
                "Healthcare": "प्राथमिक स्वास्थ्य केंद्र में बेहतर सुविधाओं की आवश्यकता है।",
                "Road": "सड़क की हालत खराब है और मरम्मत की जरूरत है।",
                "Drainage": "नालियों में पानी भर जाने से जलभराव हो रहा है।",
                "Banking": "गांव में एटीएम या बैंकिंग सुविधा उपलब्ध कराई जाए।",
                "Water": "पीने के साफ पानी की व्यवस्था की जाए।",
                "Education": "स्कूल में बेहतर सुविधाओं और शिक्षकों की मांग है।",
                "Public Transport": "बस सेवा बढ़ाने का अनुरोध किया गया है।",
                "Electricity": "बिजली की बार-बार कटौती से लोग परेशान हैं।",
                "Digital Connectivity": "इंटरनेट और डिजिटल सेवा केंद्र की जरूरत है।"
            }
            desc = hindi_phrases.get(cat, desc_pair[0])
        else:
            desc = desc_pair[0]

        severity = random.choices(["High", "Medium", "Low"], weights=[0.35, 0.45, 0.20], k=1)[0]
        ts = start_date + timedelta(days=random.randint(0, 78), hours=random.randint(6, 21), minutes=random.randint(0, 59))
        
        requests.append([
            f"REQ{req_id:06d}",
            code,
            name,
            "Bangalore",
            "KARNATAKA",
            cat,
            desc,
            lang,
            severity,
            ts.strftime("%Y-%m-%dT%H:%M"),
            "Synthetic Demo Data"
        ])
        req_id += 1

# Write citizen_requests_bangalore_synthetic.csv
with open('data/citizen_requests_bangalore_synthetic.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "request_id","village_code","village_name","district_name","state_name",
        "category","description","language","severity","timestamp","source"
    ])
    for r in requests:
        writer.writerow(r)

print(f"Generated {len(villages_raw)} villages and {len(requests)} citizen requests.")
