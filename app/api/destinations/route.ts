import { NextRequest, NextResponse } from 'next/server'
import { searchDestinationImages } from '@/lib/unsplash'
import { gemini } from '@/lib/ai-gemini'

// Expanded worldwide destinations database with background images
const POPULAR_DESTINATIONS = [
    // Asia
    { name: 'Tokyo', country: 'Japan', continent: 'Asia', lat: 35.6762, lng: 139.6503, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
    { name: 'Bangkok', country: 'Thailand', continent: 'Asia', lat: 13.7563, lng: 100.5018, image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800' },
    { name: 'Singapore', country: 'Singapore', continent: 'Asia', lat: 1.3521, lng: 103.8198, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800' },
    { name: 'Dubai', country: 'UAE', continent: 'Asia', lat: 25.2048, lng: 55.2708, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
    { name: 'Bali', country: 'Indonesia', continent: 'Asia', lat: -8.3405, lng: 115.0920, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
    { name: 'Seoul', country: 'South Korea', continent: 'Asia', lat: 37.5665, lng: 126.9780, image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800' },
    { name: 'Hong Kong', country: 'China', continent: 'Asia', lat: 22.3193, lng: 114.1694, image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800' },
    { name: 'Kyoto', country: 'Japan', continent: 'Asia', lat: 35.0116, lng: 135.7681, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
    { name: 'Shanghai', country: 'China', continent: 'Asia', lat: 31.2304, lng: 121.4737, image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800' },
    { name: 'Phuket', country: 'Thailand', continent: 'Asia', lat: 7.8804, lng: 98.3923, image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800' },
    { name: 'Kuala Lumpur', country: 'Malaysia', continent: 'Asia', lat: 3.1390, lng: 101.6869, image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800' },
    { name: 'Hanoi', country: 'Vietnam', continent: 'Asia', lat: 21.0285, lng: 105.8542, image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800' },
    { name: 'Maldives', country: 'Maldives', continent: 'Asia', lat: 3.2028, lng: 73.2207, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800' },
    { name: 'Osaka', country: 'Japan', continent: 'Asia', lat: 34.6937, lng: 135.5023, image: 'https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e?w=800' },
    { name: 'Beijing', country: 'China', continent: 'Asia', lat: 39.9042, lng: 116.4074, image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800' },
    { name: 'Taipei', country: 'Taiwan', continent: 'Asia', lat: 25.0330, lng: 121.5654, image: 'https://images.unsplash.com/photo-1540960149-a0d4e1e8f3e3?w=800' },
    { name: 'Chiang Mai', country: 'Thailand', continent: 'Asia', lat: 18.7883, lng: 98.9853, image: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800' },

    //all asia destinations
    { name: 'Almaty', country: 'Kazakhstan', continent: 'Asia', lat: 43.2220, lng: 76.8512, image: 'https://source.unsplash.com/800x600/?almaty' },
    { name: 'Astana', country: 'Kazakhstan', continent: 'Asia', lat: 51.1694, lng: 71.4491, image: 'https://source.unsplash.com/800x600/?astana' },
    { name: 'Tashkent', country: 'Uzbekistan', continent: 'Asia', lat: 41.2995, lng: 69.2401, image: 'https://source.unsplash.com/800x600/?tashkent' },
    { name: 'Samarkand', country: 'Uzbekistan', continent: 'Asia', lat: 39.6542, lng: 66.9597, image: 'https://source.unsplash.com/800x600/?samarkand' },
    { name: 'Bukhara', country: 'Uzbekistan', continent: 'Asia', lat: 39.7747, lng: 64.4286, image: 'https://source.unsplash.com/800x600/?bukhara' },
    { name: 'Bishkek', country: 'Kyrgyzstan', continent: 'Asia', lat: 42.8746, lng: 74.5698, image: 'https://source.unsplash.com/800x600/?bishkek' },
    { name: 'Dushanbe', country: 'Tajikistan', continent: 'Asia', lat: 38.5598, lng: 68.7870, image: 'https://source.unsplash.com/800x600/?dushanbe' },
    { name: 'Ashgabat', country: 'Turkmenistan', continent: 'Asia', lat: 37.9601, lng: 58.3261, image: 'https://source.unsplash.com/800x600/?ashgabat' },
    { name: 'Yerevan', country: 'Armenia', continent: 'Asia', lat: 40.1792, lng: 44.4991, image: 'https://source.unsplash.com/800x600/?yerevan' },
    { name: 'Baku', country: 'Azerbaijan', continent: 'Asia', lat: 40.4093, lng: 49.8671, image: 'https://source.unsplash.com/800x600/?baku' },
    { name: 'Tbilisi', country: 'Georgia', continent: 'Asia', lat: 41.7151, lng: 44.8271, image: 'https://source.unsplash.com/800x600/?tbilisi' },
    { name: 'Riyadh', country: 'Saudi Arabia', continent: 'Asia', lat: 24.7136, lng: 46.6753, image: 'https://source.unsplash.com/800x600/?riyadh' },
    { name: 'Jeddah', country: 'Saudi Arabia', continent: 'Asia', lat: 21.4858, lng: 39.1925, image: 'https://source.unsplash.com/800x600/?jeddah' },
    { name: 'Doha', country: 'Qatar', continent: 'Asia', lat: 25.2854, lng: 51.5310, image: 'https://source.unsplash.com/800x600/?doha' },
    { name: 'Manama', country: 'Bahrain', continent: 'Asia', lat: 26.2235, lng: 50.5876, image: 'https://source.unsplash.com/800x600/?manama' },
    { name: 'Muscat', country: 'Oman', continent: 'Asia', lat: 23.5880, lng: 58.3829, image: 'https://source.unsplash.com/800x600/?muscat' },
    { name: 'Kuwait City', country: 'Kuwait', continent: 'Asia', lat: 29.3759, lng: 47.9774, image: 'https://source.unsplash.com/800x600/?kuwait+city' },
    { name: 'Jerusalem', country: 'Israel', continent: 'Asia', lat: 31.7683, lng: 35.2137, image: 'https://source.unsplash.com/800x600/?jerusalem' },
    { name: 'Tel Aviv', country: 'Israel', continent: 'Asia', lat: 32.0853, lng: 34.7818, image: 'https://source.unsplash.com/800x600/?tel+aviv' },
    { name: 'Amman', country: 'Jordan', continent: 'Asia', lat: 31.9454, lng: 35.9284, image: 'https://source.unsplash.com/800x600/?amman' },
    { name: 'Tehran', country: 'Iran', continent: 'Asia', lat: 35.6892, lng: 51.3890, image: 'https://source.unsplash.com/800x600/?tehran' },
    { name: 'Shiraz', country: 'Iran', continent: 'Asia', lat: 29.5918, lng: 52.5837, image: 'https://source.unsplash.com/800x600/?shiraz' },
    { name: 'Isfahan', country: 'Iran', continent: 'Asia', lat: 32.6546, lng: 51.6680, image: 'https://source.unsplash.com/800x600/?isfahan' },
    { name: 'Ulaanbaatar', country: 'Mongolia', continent: 'Asia', lat: 47.8864, lng: 106.9057, image: 'https://source.unsplash.com/800x600/?ulaanbaatar' },
    { name: 'Busan', country: 'South Korea', continent: 'Asia', lat: 35.1796, lng: 129.0756, image: 'https://source.unsplash.com/800x600/?busan' },
    { name: 'Jeju', country: 'South Korea', continent: 'Asia', lat: 33.4996, lng: 126.5312, image: 'https://source.unsplash.com/800x600/?jeju+island' },
    { name: 'Macau', country: 'China', continent: 'Asia', lat: 22.1987, lng: 113.5439, image: 'https://source.unsplash.com/800x600/?macau' },
    { name: 'Shenzhen', country: 'China', continent: 'Asia', lat: 22.5431, lng: 114.0579, image: 'https://source.unsplash.com/800x600/?shenzhen' },
    { name: 'Guangzhou', country: 'China', continent: 'Asia', lat: 23.1291, lng: 113.2644, image: 'https://source.unsplash.com/800x600/?guangzhou' },
    { name: 'Manila', country: 'Philippines', continent: 'Asia', lat: 14.5995, lng: 120.9842, image: 'https://source.unsplash.com/800x600/?manila' },
    { name: 'Cebu', country: 'Philippines', continent: 'Asia', lat: 10.3157, lng: 123.8854, image: 'https://source.unsplash.com/800x600/?cebu' },
    { name: 'Jakarta', country: 'Indonesia', continent: 'Asia', lat: -6.2088, lng: 106.8456, image: 'https://source.unsplash.com/800x600/?jakarta' },
    { name: 'Yogyakarta', country: 'Indonesia', continent: 'Asia', lat: -7.7956, lng: 110.3695, image: 'https://source.unsplash.com/800x600/?yogyakarta' },
    { name: 'Yangon', country: 'Myanmar', continent: 'Asia', lat: 16.8409, lng: 96.1735, image: 'https://source.unsplash.com/800x600/?yangon' },
    { name: 'Mandalay', country: 'Myanmar', continent: 'Asia', lat: 21.9588, lng: 96.0891, image: 'https://source.unsplash.com/800x600/?mandalay' },
    { name: 'Colombo', country: 'Sri Lanka', continent: 'Asia', lat: 6.9271, lng: 79.8612, image: 'https://source.unsplash.com/800x600/?colombo' },
    { name: 'Kandy', country: 'Sri Lanka', continent: 'Asia', lat: 7.2906, lng: 80.6337, image: 'https://source.unsplash.com/800x600/?kandy+sri+lanka' },
    { name: 'Kathmandu', country: 'Nepal', continent: 'Asia', lat: 27.7172, lng: 85.3240, image: 'https://source.unsplash.com/800x600/?kathmandu' },
    { name: 'Pokhara', country: 'Nepal', continent: 'Asia', lat: 28.2096, lng: 83.9856, image: 'https://source.unsplash.com/800x600/?pokhara' },
    { name: 'Male', country: 'Maldives', continent: 'Asia', lat: 4.1755, lng: 73.5093, image: 'https://source.unsplash.com/800x600/?male+maldives' },
    { name: 'Vladivostok', country: 'Russia', continent: 'Asia', lat: 43.1155, lng: 131.8855, image: 'https://source.unsplash.com/800x600/?vladivostok' },
    { name: 'Irkutsk', country: 'Russia', continent: 'Asia', lat: 52.2870, lng: 104.2810, image: 'https://source.unsplash.com/800x600/?irkutsk' },
    { name: 'Yakutsk', country: 'Russia', continent: 'Asia', lat: 62.0355, lng: 129.6755, image: 'https://source.unsplash.com/800x600/?yakutsk' },
    { name: 'Novosibirsk', country: 'Russia', continent: 'Asia', lat: 55.0084, lng: 82.9357, image: 'https://source.unsplash.com/800x600/?novosibirsk' },

    { name: 'Chengdu', country: 'China', continent: 'Asia', lat: 30.5728, lng: 104.0668, image: 'https://source.unsplash.com/800x600/?chengdu' },
    { name: 'Hangzhou', country: 'China', continent: 'Asia', lat: 30.2741, lng: 120.1551, image: 'https://source.unsplash.com/800x600/?hangzhou' },
    { name: 'Suzhou', country: 'China', continent: 'Asia', lat: 31.2989, lng: 120.5853, image: 'https://source.unsplash.com/800x600/?suzhou+china' },
    { name: 'Xian', country: 'China', continent: 'Asia', lat: 34.3416, lng: 108.9398, image: 'https://source.unsplash.com/800x600/?xian+china' },
    { name: 'Harbin', country: 'China', continent: 'Asia', lat: 45.8038, lng: 126.5349, image: 'https://source.unsplash.com/800x600/?harbin' },
    { name: 'Qingdao', country: 'China', continent: 'Asia', lat: 36.0671, lng: 120.3826, image: 'https://source.unsplash.com/800x600/?qingdao' },
    { name: 'Dalian', country: 'China', continent: 'Asia', lat: 38.9140, lng: 121.6147, image: 'https://source.unsplash.com/800x600/?dalian' },
    { name: 'Wuhan', country: 'China', continent: 'Asia', lat: 30.5928, lng: 114.3055, image: 'https://source.unsplash.com/800x600/?wuhan' },
    { name: 'Nanjing', country: 'China', continent: 'Asia', lat: 32.0603, lng: 118.7969, image: 'https://source.unsplash.com/800x600/?nanjing' },
    { name: 'Xiamen', country: 'China', continent: 'Asia', lat: 24.4798, lng: 118.0894, image: 'https://source.unsplash.com/800x600/?xiamen' },
    { name: 'Fuzhou', country: 'China', continent: 'Asia', lat: 26.0745, lng: 119.2965, image: 'https://source.unsplash.com/800x600/?fuzhou+china' },
    { name: 'Shenyang', country: 'China', continent: 'Asia', lat: 41.8057, lng: 123.4315, image: 'https://source.unsplash.com/800x600/?shenyang' },
    { name: 'Kunming', country: 'China', continent: 'Asia', lat: 25.0389, lng: 102.7183, image: 'https://source.unsplash.com/800x600/?kunming' },
    { name: 'Lijiang', country: 'China', continent: 'Asia', lat: 26.8721, lng: 100.2207, image: 'https://source.unsplash.com/800x600/?lijiang' },

    { name: 'Khabarovsk', country: 'Russia', continent: 'Asia', lat: 48.4802, lng: 135.0719, image: 'https://source.unsplash.com/800x600/?khabarovsk' },
    { name: 'Ulan-Ude', country: 'Russia', continent: 'Asia', lat: 51.8345, lng: 107.5846, image: 'https://source.unsplash.com/800x600/?ulan+ude' },
    { name: 'Chita', country: 'Russia', continent: 'Asia', lat: 52.0340, lng: 113.4994, image: 'https://source.unsplash.com/800x600/?chita+russia' },
    { name: 'Blagoveshchensk', country: 'Russia', continent: 'Asia', lat: 50.2907, lng: 127.5272, image: 'https://source.unsplash.com/800x600/?blagoveshchensk' },
    { name: 'Petropavlovsk-Kamchatsky', country: 'Russia', continent: 'Asia', lat: 53.0452, lng: 158.6483, image: 'https://source.unsplash.com/800x600/?kamchatka' },
    { name: 'Magadan', country: 'Russia', continent: 'Asia', lat: 59.5611, lng: 150.8301, image: 'https://source.unsplash.com/800x600/?magadan' },
    { name: 'Yuzhno-Sakhalinsk', country: 'Russia', continent: 'Asia', lat: 46.9591, lng: 142.7380, image: 'https://source.unsplash.com/800x600/?sakhalin' },
    { name: 'Norilsk', country: 'Russia', continent: 'Asia', lat: 69.3558, lng: 88.1893, image: 'https://source.unsplash.com/800x600/?norilsk' },
    { name: 'Bratsk', country: 'Russia', continent: 'Asia', lat: 56.1513, lng: 101.6342, image: 'https://source.unsplash.com/800x600/?bratsk' },
    { name: 'Angarsk', country: 'Russia', continent: 'Asia', lat: 52.5448, lng: 103.8885, image: 'https://source.unsplash.com/800x600/?angarsk' },

// ---------- SOUTH KOREA ----------
    { name: 'Incheon', country: 'South Korea', continent: 'Asia', lat: 37.4563, lng: 126.7052, image: 'https://source.unsplash.com/800x600/?incheon' },
    { name: 'Daegu', country: 'South Korea', continent: 'Asia', lat: 35.8714, lng: 128.6014, image: 'https://source.unsplash.com/800x600/?daegu' },
    { name: 'Daejeon', country: 'South Korea', continent: 'Asia', lat: 36.3504, lng: 127.3845, image: 'https://source.unsplash.com/800x600/?daejeon' },
    { name: 'Gwangju', country: 'South Korea', continent: 'Asia', lat: 35.1595, lng: 126.8526, image: 'https://source.unsplash.com/800x600/?gwangju+korea' },
    { name: 'Suwon', country: 'South Korea', continent: 'Asia', lat: 37.2636, lng: 127.0286, image: 'https://source.unsplash.com/800x600/?suwon' },
    { name: 'Ulsan', country: 'South Korea', continent: 'Asia', lat: 35.5384, lng: 129.3114, image: 'https://source.unsplash.com/800x600/?ulsan' },
    { name: 'Gangneung', country: 'South Korea', continent: 'Asia', lat: 37.7519, lng: 128.8761, image: 'https://source.unsplash.com/800x600/?gangneung' },
    { name: 'Pohang', country: 'South Korea', continent: 'Asia', lat: 36.0190, lng: 129.3435, image: 'https://source.unsplash.com/800x600/?pohang' },
    { name: 'Jeonju', country: 'South Korea', continent: 'Asia', lat: 35.8242, lng: 127.1480, image: 'https://source.unsplash.com/800x600/?jeonju' },
    { name: 'Yeosu', country: 'South Korea', continent: 'Asia', lat: 34.7604, lng: 127.6622, image: 'https://source.unsplash.com/800x600/?yeosu' },

// ---------- THAILAND ----------
    { name: 'Krabi', country: 'Thailand', continent: 'Asia', lat: 8.0863, lng: 98.9063, image: 'https://source.unsplash.com/800x600/?krabi' },
    { name: 'Pattaya', country: 'Thailand', continent: 'Asia', lat: 12.9236, lng: 100.8825, image: 'https://source.unsplash.com/800x600/?pattaya' },
    { name: 'Hua Hin', country: 'Thailand', continent: 'Asia', lat: 12.5684, lng: 99.9577, image: 'https://source.unsplash.com/800x600/?hua+hin' },
    { name: 'Rayong', country: 'Thailand', continent: 'Asia', lat: 12.6814, lng: 101.2789, image: 'https://source.unsplash.com/800x600/?rayong' },
    { name: 'Surat Thani', country: 'Thailand', continent: 'Asia', lat: 9.1382, lng: 99.3215, image: 'https://source.unsplash.com/800x600/?surat+thani' },
    { name: 'Nakhon Ratchasima', country: 'Thailand', continent: 'Asia', lat: 14.9799, lng: 102.0977, image: 'https://source.unsplash.com/800x600/?korat' },
    { name: 'Udon Thani', country: 'Thailand', continent: 'Asia', lat: 17.4138, lng: 102.7876, image: 'https://source.unsplash.com/800x600/?udon+thani' },
    { name: 'Lampang', country: 'Thailand', continent: 'Asia', lat: 18.2855, lng: 99.5128, image: 'https://source.unsplash.com/800x600/?lampang' },
    { name: 'Nan', country: 'Thailand', continent: 'Asia', lat: 18.7756, lng: 100.7730, image: 'https://source.unsplash.com/800x600/?nan+thailand' },
    { name: 'Trat', country: 'Thailand', continent: 'Asia', lat: 12.2427, lng: 102.5175, image: 'https://source.unsplash.com/800x600/?trat+thailand' },

// ---------- VIETNAM ----------
    { name: 'Da Nang', country: 'Vietnam', continent: 'Asia', lat: 16.0544, lng: 108.2022, image: 'https://source.unsplash.com/800x600/?da+nang' },
    { name: 'Hoi An', country: 'Vietnam', continent: 'Asia', lat: 15.8801, lng: 108.3380, image: 'https://source.unsplash.com/800x600/?hoi+an' },
    { name: 'Nha Trang', country: 'Vietnam', continent: 'Asia', lat: 12.2388, lng: 109.1967, image: 'https://source.unsplash.com/800x600/?nha+trang' },
    { name: 'Hue', country: 'Vietnam', continent: 'Asia', lat: 16.4498, lng: 107.5624, image: 'https://source.unsplash.com/800x600/?hue+vietnam' },
    { name: 'Vung Tau', country: 'Vietnam', continent: 'Asia', lat: 10.4114, lng: 107.1362, image: 'https://source.unsplash.com/800x600/?vung+tau' },
    { name: 'Can Tho', country: 'Vietnam', continent: 'Asia', lat: 10.0452, lng: 105.7469, image: 'https://source.unsplash.com/800x600/?can+tho' },
    { name: 'Phan Thiet', country: 'Vietnam', continent: 'Asia', lat: 10.9804, lng: 108.2615, image: 'https://source.unsplash.com/800x600/?phan+thiet' },
    { name: 'Da Lat', country: 'Vietnam', continent: 'Asia', lat: 11.9404, lng: 108.4583, image: 'https://source.unsplash.com/800x600/?da+lat' },
    { name: 'Quy Nhon', country: 'Vietnam', continent: 'Asia', lat: 13.7563, lng: 109.2297, image: 'https://source.unsplash.com/800x600/?quy+nhon' },
    { name: 'Pleiku', country: 'Vietnam', continent: 'Asia', lat: 13.9833, lng: 108.0000, image: 'https://source.unsplash.com/800x600/?pleiku' },

// ---------- INDONESIA ----------
    { name: 'Surabaya', country: 'Indonesia', continent: 'Asia', lat: -7.2575, lng: 112.7521, image: 'https://source.unsplash.com/800x600/?surabaya' },
    { name: 'Bandung', country: 'Indonesia', continent: 'Asia', lat: -6.9175, lng: 107.6191, image: 'https://source.unsplash.com/800x600/?bandung' },
    { name: 'Semarang', country: 'Indonesia', continent: 'Asia', lat: -6.9667, lng: 110.4167, image: 'https://source.unsplash.com/800x600/?semarang' },
    { name: 'Solo', country: 'Indonesia', continent: 'Asia', lat: -7.5667, lng: 110.8167, image: 'https://source.unsplash.com/800x600/?solo+java' },
    { name: 'Malang', country: 'Indonesia', continent: 'Asia', lat: -7.9839, lng: 112.6214, image: 'https://source.unsplash.com/800x600/?malang' },
    { name: 'Makassar', country: 'Indonesia', continent: 'Asia', lat: -5.1477, lng: 119.4327, image: 'https://source.unsplash.com/800x600/?makassar' },
    { name: 'Balikpapan', country: 'Indonesia', continent: 'Asia', lat: -1.2379, lng: 116.8529, image: 'https://source.unsplash.com/800x600/?balikpapan' },
    { name: 'Pontianak', country: 'Indonesia', continent: 'Asia', lat: -0.0263, lng: 109.3425, image: 'https://source.unsplash.com/800x600/?pontianak' },
    { name: 'Banjarmasin', country: 'Indonesia', continent: 'Asia', lat: -3.3186, lng: 114.5944, image: 'https://source.unsplash.com/800x600/?banjarmasin' },
    { name: 'Jayapura', country: 'Indonesia', continent: 'Asia', lat: -2.5916, lng: 140.6690, image: 'https://source.unsplash.com/800x600/?jayapura' },

// ---------- TAIWAN ----------
    { name: 'Kaohsiung', country: 'Taiwan', continent: 'Asia', lat: 22.6273, lng: 120.3014, image: 'https://source.unsplash.com/800x600/?kaohsiung' },
    { name: 'Taichung', country: 'Taiwan', continent: 'Asia', lat: 24.1477, lng: 120.6736, image: 'https://source.unsplash.com/800x600/?taichung' },
    { name: 'Tainan', country: 'Taiwan', continent: 'Asia', lat: 22.9997, lng: 120.2270, image: 'https://source.unsplash.com/800x600/?tainan' },
    { name: 'Hsinchu', country: 'Taiwan', continent: 'Asia', lat: 24.8138, lng: 120.9675, image: 'https://source.unsplash.com/800x600/?hsinchu' },
    { name: 'Keelung', country: 'Taiwan', continent: 'Asia', lat: 25.1276, lng: 121.7392, image: 'https://source.unsplash.com/800x600/?keelung' },

// ---------- PHILIPPINES ----------
    { name: 'Davao', country: 'Philippines', continent: 'Asia', lat: 7.1907, lng: 125.4553, image: 'https://source.unsplash.com/800x600/?davao' },
    { name: 'Iloilo', country: 'Philippines', continent: 'Asia', lat: 10.7202, lng: 122.5621, image: 'https://source.unsplash.com/800x600/?iloilo' },
    { name: 'Cagayan de Oro', country: 'Philippines', continent: 'Asia', lat: 8.4542, lng: 124.6319, image: 'https://source.unsplash.com/800x600/?cagayan+de+oro' },
    { name: 'Baguio', country: 'Philippines', continent: 'Asia', lat: 16.4023, lng: 120.5960, image: 'https://source.unsplash.com/800x600/?baguio' },
    { name: 'Zamboanga', country: 'Philippines', continent: 'Asia', lat: 6.9214, lng: 122.0790, image: 'https://source.unsplash.com/800x600/?zamboanga' },
    { name: 'Tagaytay', country: 'Philippines', continent: 'Asia', lat: 14.1153, lng: 120.9621, image: 'https://source.unsplash.com/800x600/?tagaytay' },

// ---------- EUROPE ----------
    { name: 'Paris', country: 'France', continent: 'Europe', lat: 48.8566, lng: 2.3522, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
    { name: 'London', country: 'UK', continent: 'Europe', lat: 51.5074, lng: -0.1278, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
    { name: 'Rome', country: 'Italy', continent: 'Europe', lat: 41.9028, lng: 12.4964, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
    { name: 'Barcelona', country: 'Spain', continent: 'Europe', lat: 41.3851, lng: 2.1734, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
    { name: 'Amsterdam', country: 'Netherlands', continent: 'Europe', lat: 52.3676, lng: 4.9041, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800' },
    { name: 'Prague', country: 'Czech Republic', continent: 'Europe', lat: 50.0755, lng: 14.4378, image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800' },
    { name: 'Vienna', country: 'Austria', continent: 'Europe', lat: 48.2082, lng: 16.3738, image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800' },
    { name: 'Istanbul', country: 'Turkey', continent: 'Europe', lat: 41.0082, lng: 28.9784, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800' },
    { name: 'Athens', country: 'Greece', continent: 'Europe', lat: 37.9838, lng: 23.7275, image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800' },
    { name: 'Venice', country: 'Italy', continent: 'Europe', lat: 45.4408, lng: 12.3155, image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800' },
    { name: 'Santorini', country: 'Greece', continent: 'Europe', lat: 36.3932, lng: 25.4615, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800' },
    { name: 'Lisbon', country: 'Portugal', continent: 'Europe', lat: 38.7223, lng: -9.1393, image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800' },
    { name: 'Berlin', country: 'Germany', continent: 'Europe', lat: 52.5200, lng: 13.4050, image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800' },
    { name: 'Madrid', country: 'Spain', continent: 'Europe', lat: 40.4168, lng: -3.7038, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800' },
    { name: 'Budapest', country: 'Hungary', continent: 'Europe', lat: 47.4979, lng: 19.0402, image: 'https://images.unsplash.com/photo-1541963058-d5c01eec0c4e?w=800' },
    { name: 'Edinburgh', country: 'Scotland', continent: 'Europe', lat: 55.9533, lng: -3.1883, image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800' },

    // Americas
    { name: 'New York', country: 'USA', continent: 'North America', lat: 40.7128, lng: -74.0060, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
    { name: 'Los Angeles', country: 'USA', continent: 'North America', lat: 34.0522, lng: -118.2437, image: 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800' },
    { name: 'Miami', country: 'USA', continent: 'North America', lat: 25.7617, lng: -80.1918, image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800' },
    { name: 'Cancun', country: 'Mexico', continent: 'North America', lat: 21.1619, lng: -86.8515, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800' },
    { name: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', lat: -22.9068, lng: -43.1729, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800' },
    { name: 'Buenos Aires', country: 'Argentina', continent: 'South America', lat: -34.6037, lng: -58.3816, image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800' },
    { name: 'San Francisco', country: 'USA', continent: 'North America', lat: 37.7749, lng: -122.4194, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800' },
    { name: 'Las Vegas', country: 'USA', continent: 'North America', lat: 36.1699, lng: -115.1398, image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800' },
    { name: 'Toronto', country: 'Canada', continent: 'North America', lat: 43.6532, lng: -79.3832, image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800' },
    { name: 'Vancouver', country: 'Canada', continent: 'North America', lat: 49.2827, lng: -123.1207, image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800' },
    { name: 'Mexico City', country: 'Mexico', continent: 'North America', lat: 19.4326, lng: -99.1332, image: 'https://images.unsplash.com/photo-1518659526054-e6c2c5c1c6c7?w=800' },
    { name: 'Lima', country: 'Peru', continent: 'South America', lat: -12.0464, lng: -77.0428, image: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800' },

    // Oceania
    { name: 'Sydney', country: 'Australia', continent: 'Oceania', lat: -33.8688, lng: 151.2093, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' },
    { name: 'Melbourne', country: 'Australia', continent: 'Oceania', lat: -37.8136, lng: 144.9631, image: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800' },
    { name: 'Auckland', country: 'New Zealand', continent: 'Oceania', lat: -36.8485, lng: 174.7633, image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800' },
    { name: 'Queenstown', country: 'New Zealand', continent: 'Oceania', lat: -45.0312, lng: 168.6626, image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800' },
    { name: 'Gold Coast', country: 'Australia', continent: 'Oceania', lat: -28.0167, lng: 153.4000, image: 'https://images.unsplash.com/photo-1583952734649-9b8a9d0d4c8e?w=800' },

    // Africa
    { name: 'Cape Town', country: 'South Africa', continent: 'Africa', lat: -33.9249, lng: 18.4241, image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800' },
    { name: 'Marrakech', country: 'Morocco', continent: 'Africa', lat: 31.6295, lng: -7.9811, image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800' },
    { name: 'Cairo', country: 'Egypt', continent: 'Africa', lat: 30.0444, lng: 31.2357, image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800' },
    { name: 'Nairobi', country: 'Kenya', continent: 'Africa', lat: -1.2921, lng: 36.8219, image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800' },
    { name: 'Zanzibar', country: 'Tanzania', continent: 'Africa', lat: -6.1659, lng: 39.2026, image: 'https://images.unsplash.com/photo-1568625365034-c3bb47a5f0c1?w=800' },

    // India
    { name: 'Mumbai', country: 'India', continent: 'Asia', lat: 19.0760, lng: 72.8777, image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800' },
    { name: 'Delhi', country: 'India', continent: 'Asia', lat: 28.6139, lng: 77.2090, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800' },
    { name: 'Bangalore', country: 'India', continent: 'Asia', lat: 12.9716, lng: 77.5946, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800' },
    { name: 'Goa', country: 'India', continent: 'Asia', lat: 15.2993, lng: 74.1240, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800' },
    { name: 'Jaipur', country: 'India', continent: 'Asia', lat: 26.9124, lng: 75.7873, image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800' },
    { name: 'Kerala', country: 'India', continent: 'Asia', lat: 10.8505, lng: 76.2711, image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800' },
    { name: 'Agra', country: 'India', continent: 'Asia', lat: 27.1767, lng: 78.0081, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800' },
    { name: 'Udaipur', country: 'India', continent: 'Asia', lat: 24.5854, lng: 73.7125, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800' },
    { name: 'Varanasi', country: 'India', continent: 'Asia', lat: 25.3176, lng: 82.9739, image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800' },
    { name: 'Kolkata', country: 'India', continent: 'Asia', lat: 22.5726, lng: 88.3639, image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800' },
    { name: 'Chennai', country: 'India', continent: 'Asia', lat: 13.0827, lng: 80.2707, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800' },
    { name: 'Hyderabad', country: 'India', continent: 'Asia', lat: 17.3850, lng: 78.4867, image: 'https://images.unsplash.com/photo-1603262110225-d6f31d1a4d0d?w=800' },
    { name: 'Pune', country: 'India', continent: 'Asia', lat: 18.5204, lng: 73.8567, image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800' },
    { name: 'Ahmedabad', country: 'India', continent: 'Asia', lat: 23.0225, lng: 72.5714, image: 'https://images.unsplash.com/photo-1585737034897-e9f0b4e5d3d9?w=800' },
    { name: 'Indore', country: 'India', continent: 'Asia', lat: 22.7196, lng: 75.8577, image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800' },
    { name: 'Rajkot', country: 'India', continent: 'Asia', lat: 22.3039, lng: 70.8022, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800' },
    { name: 'Shimla', country: 'India', continent: 'Asia', lat: 31.1048, lng: 77.1734, image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800' },
    { name: 'Rishikesh', country: 'India', continent: 'Asia', lat: 30.0869, lng: 78.2676, image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800' },
]

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const query = searchParams.get('query')?.toLowerCase()
        const action = searchParams.get('action') // 'search' or 'details'

        // Autocomplete search
        if (query && action === 'search') {
            const matches = POPULAR_DESTINATIONS.filter(dest =>
                dest.name.toLowerCase().includes(query) ||
                dest.country.toLowerCase().includes(query)
            ).slice(0, 10)

            return NextResponse.json({ destinations: matches })
        }

        // Get destination details
        if (query && action === 'details') {
            const destination = POPULAR_DESTINATIONS.find(
                dest => dest.name.toLowerCase() === query
            )

            if (!destination) {
                return NextResponse.json(
                    { error: 'Destination not found' },
                    { status: 404 }
                )
            }

            // Fetch real images from Unsplash
            const images = await searchDestinationImages(destination.name, 6)

            // Generate AI summary
            let aiSummary = ''
            try {
                aiSummary = await gemini(
                    `Write a compelling 150-word travel guide for ${destination.name}, ${destination.country}. Include: best time to visit, top attractions, local culture, must-try food, and unique experiences. Make it engaging and informative.`
                )
            } catch (error) {
                aiSummary = `${destination.name} is a captivating destination in ${destination.country}, offering unforgettable experiences for every traveler.`
            }

            // Generate local tips
            let localTips: string[] = []
            try {
                const tipsResponse = await gemini(
                    `Provide 5 practical travel tips for visiting ${destination.name}, ${destination.country}. Format as a simple list, each tip concise and actionable.`
                )
                localTips = tipsResponse
                    .split('\n')
                    .filter((tip: string) => tip.trim().length > 0)
                    .map((tip: string) => tip.replace(/^[-•*]\s*/, '').trim())
                    .slice(0, 5)
            } catch (error) {
                localTips = [
                    'Book accommodations in advance during peak season',
                    'Learn a few basic local phrases',
                    'Try authentic local cuisine',
                    'Respect local customs and traditions',
                    'Keep emergency contacts handy'
                ]
            }

            // Generate top attractions
            let attractions: Array<{ name: string; description: string; category: string }> = []
            try {
                const attractionsPrompt = `List 5 top tourist attractions in ${destination.name}, ${destination.country}. For each, provide: name, brief 1-sentence description, and category (Historical/Nature/Cultural/Entertainment). Format as JSON array.`
                const attractionsResponse = await gemini(attractionsPrompt)
                attractions = JSON.parse(attractionsResponse)
            } catch (error) {
                attractions = [
                    { name: 'City Center', description: 'Explore the vibrant heart of the city', category: 'Cultural' },
                    { name: 'Historic District', description: 'Discover rich history and heritage', category: 'Historical' },
                    { name: 'Local Market', description: 'Experience authentic local life', category: 'Cultural' },
                ]
            }

            return NextResponse.json({
                destination: {
                    ...destination,
                    images: images.map(img => ({
                        url: img.urls.regular,
                        thumb: img.urls.thumb,
                        photographer: img.user.name,
                        photographerUrl: img.user.links.html,
                        alt: img.alt_description || destination.name
                    })),
                    aiSummary,
                    localTips,
                    attractions
                }
            })
        }

        // Return popular destinations
        return NextResponse.json({ destinations: POPULAR_DESTINATIONS.slice(0, 30) })
    } catch (error) {
        console.error('Error in destinations API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
