# -*- coding: utf-8 -*-

dinner_menu = {"干炒牛河": 65, "星洲炒米": 60, "陽州炒飯": 68, "銀芽炒米粉": 55, "蝦仁炒飯": 70}

套餐 = 10
凍飲 = 6
熱飲 = 3

點餐 = input("今日想食乜9？ 有 干炒牛河, 星洲炒米, 陽州炒飯, 銀芽炒米粉, 蝦仁炒飯: ")

if 點餐 in dinner_menu:
    while True:
            dish_price = dinner_menu[點餐]
            total = dish_price
            
            升級 = input("跟唔跟套餐？有老火湯有餐飲 (跟/唔跟): ").upper()
            if 升級 == "跟" or 升級 == "Y":
                print(f"升級套餐加『{套餐}』蚊")
                while True:
                    飲品 = input("飲咩 (凍飲定熱飲): ").upper()
                    if 飲品 == "凍飲" or 飲品 == "COLD":
                        print(f"凍飲加『{凍飲}』蚊")
                        total += 凍飲
                        break
                    elif 飲品 == "熱飲" or 飲品 == "HOT":
                        print(f"熱飲加『{熱飲}』蚊")
                        total += 熱飲
                        break
                    else:
                        print("DIU 一係凍飲一係熱飲呀 PK)")
                
                
                total += 套餐
                
            else:
                print("好，唔跟餐！")
            
            print(f"復一次你叫 {點餐}")
            if 升級 == "跟" or 升級 == "Y":
                print(f"升級套餐加左『{套餐}』蚊")
                if 飲品 == "凍飲" or 飲品 == "COLD":
                    print(f"凍飲加左『{凍飲}』蚊")
                else:
                    print(f"熱飲加左『{熱飲}』蚊")   
            print(f"總共『{total}』蚊")
else:
    print("得 (干炒牛河, 星洲炒米, 陽州炒飯, 銀芽炒米粉, 蝦仁炒飯）揀，唔好亂揀啦！")

