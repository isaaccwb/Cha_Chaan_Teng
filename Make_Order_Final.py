# -*- coding: utf-8 -*-
#designed by Isaac Cheng

dinner_menu = {"A餐干炒牛河": 65, "B餐星洲炒米": 60, "C餐陽州炒飯": 68, "D餐銀芽炒米粉": 55, "E餐蝦仁炒飯": 70}
dinner_menu2 = {"A": 65, "B": 60, "C": 68, "D": 55, "E": 70}

套餐 = 10
凍飲 = 6
熱飲 = 3
repeat = ["吓？咩話？","重覆", "再講一次", "可唔可以講多次呀", "再講一次啦", "再講一遍啦", "再講一次啦唔該!", "再講一遍啦唔該!"]

def 點餐():
    print("今日想食乜9? 有 A 到 E 餐: ")
    
    for i in dinner_menu.keys():
        print(i)
        
    while True:
        user_choice = input()
        if user_choice in dinner_menu:
            print("好: ", user_choice)
            return user_choice
        elif user_choice in dinner_menu2:
            print("好: ", user_choice + "餐"+ " $" + str(dinner_menu2[user_choice])+"蚊")
            return user_choice
        elif user_choice in repeat:
            print("聽清楚啦? 有 A 到 E 餐: ")
            for i in dinner_menu.keys():
                print(i)
            continue
        else:
            print(" 得 A 到 E 餐揀，唔好亂揀啦！ ")
            continue

def 升級():
    print(f"跟唔跟套餐？有老火湯有埋菜有跟翻餐飲，跟唔跟: ")
    
    while True:
        upgrade_choice = input().upper()
        if upgrade_choice == "跟" or upgrade_choice == "YES" or upgrade_choice == "Y":
            print(f"好，升級套餐加${套餐}蚊")
            while True:
                print("飲咩? 凍飲定熱飲?")
                drink_choice = input().upper()
                if drink_choice in ["凍飲", "凍", "冰", "ICE", "COLD", "FROZEN"]:
                    print(f"好，凍飲加${凍飲}蚊")
                    return "跟", "凍飲"
                elif drink_choice in ["熱飲", "熱", "HOT", "WARM", "HEATED", "HOT DRINK"]:
                    print(f"好，熱飲加${熱飲}蚊")
                    return "跟", "熱飲"
                elif drink_choice in repeat:
                    print("聽清楚啦? 得凍飲和熱飲: ")
                    continue
                else:
                    print("DIU 一係凍飲一係熱飲呀 PK！再㨂過啦！")
                    continue
        elif upgrade_choice == "唔跟" or upgrade_choice == "NO" or upgrade_choice == "N":
            print("好: 唔跟餐")
            return "唔跟", None
        elif upgrade_choice in repeat:
            print("聽清楚啦? 得跟同唔跟: ")
            continue
        else:
            print("得跟同唔跟揀，唔好亂揀啦！再㨂過啦！ ")
            continue

# Get user choices
dish = 點餐()
upgrade, drink = 升級()

print(f"""
我覆一次，你揀咗{dish}餐""")

print(f"{upgrade}套餐")   
if drink:
    print(f"跟{drink}")
else:
    print("冇嘢飲")

dish_price = dinner_menu[dish] if dish in dinner_menu else dinner_menu2[dish]
upgrade_price = 套餐 if upgrade in ["跟", "YES", "Y"] else 0
drink_price = 0

if upgrade_price > 0:
    drink_price = 凍飲 if drink == "凍飲" else 熱飲

total_price = dish_price + upgrade_price + drink_price

print(f"{dish}餐: {dish_price} 蚊")
if upgrade_price > 0:
    print(f"套餐加: {upgrade_price} 蚊")
    print(f"飲品加: {drink_price} 蚊")
print(f"一共: {total_price} 蚊")
