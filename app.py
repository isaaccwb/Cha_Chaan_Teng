from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

dinner_menu = {"A餐干炒牛河": 65, "B餐星洲炒米": 60, "C餐陽州炒飯": 68, "D餐銀芽炒米粉": 55, "E餐蝦仁炒飯": 70}
dinner_menu2 = {"A": 65, "B": 60, "C": 68, "D": 55, "E": 70}

套餐 = 10
凍飲 = 6
熱飲 = 3

@app.route('/')
def index():
    return render_template('index.html', menu=dinner_menu)

@app.route('/order', methods=['POST'])
def order():
    dish = request.form.get('dish')
    upgrade = request.form.get('upgrade')
    drink = request.form.get('drink')
    
    if not dish:
        return redirect(url_for('index'))
    
    dish_price = dinner_menu.get(dish, dinner_menu2.get(dish, 0))
    upgrade_price = 套餐 if upgrade in ["跟", "YES", "Y"] else 0
    drink_price = 0
    
    if upgrade_price > 0:
        drink_price = 凍飲 if drink == "凍飲" else 熱飲
    
    total_price = dish_price + upgrade_price + drink_price
    
    return render_template('result.html', dish=dish, dish_price=dish_price, 
                           upgrade_price=upgrade_price, drink_price=drink_price, 
                           total_price=total_price)

if __name__ == '__main__':
    app.run(debug=True)
