#!/usr/bin/env python3
"""
Python高级特性练习脚本 - Day 5
包含面向对象、异常处理、装饰器、生成器等高级特性练习
"""

import time
import json
from datetime import datetime
from typing import List, Dict, Optional, Generator
from functools import wraps

# ==================== 练习1：面向对象编程 ====================

class Product:
    """产品类"""
    def __init__(self, name: str, price: float, category: str):
        self.name = name
        self.price = price
        self.category = category
    
    def __str__(self) -> str:
        return f"{self.name} (${self.price:.2f}) - {self.category}"
    
    def apply_discount(self, percent: float) -> None:
        """应用折扣"""
        if 0 <= percent <= 100:
            self.price *= (1 - percent / 100)
        else:
            raise ValueError("折扣百分比必须在0-100之间")

class ShoppingCart:
    """购物车类"""
    def __init__(self):
        self.items: List[Product] = []
    
    def add_item(self, product: Product) -> None:
        """添加商品"""
        self.items.append(product)
    
    def remove_item(self, product_name: str) -> bool:
        """移除商品"""
        for i, item in enumerate(self.items):
            if item.name == product_name:
                self.items.pop(i)
                return True
        return False
    
    def total_price(self) -> float:
        """计算总价"""
        return sum(item.price for item in self.items)
    
    def __len__(self) -> int:
        """购物车中商品数量"""
        return len(self.items)
    
    def __iter__(self):
        """迭代购物车中的商品"""
        return iter(self.items)

# ==================== 练习2：异常处理 ====================

class InventoryError(Exception):
    """库存错误"""
    pass

class OutOfStockError(InventoryError):
    """缺货错误"""
    def __init__(self, product_name: str):
        self.product_name = product_name
        super().__init__(f"商品 '{product_name}' 已缺货")

class InvalidQuantityError(InventoryError):
    """无效数量错误"""
    def __init__(self, quantity: int):
        self.quantity = quantity
        super().__init__(f"无效数量: {quantity} (必须大于0)")

class Inventory:
    """库存管理类"""
    def __init__(self):
        self.stock: Dict[str, int] = {}
    
    def add_stock(self, product_name: str, quantity: int) -> None:
        """添加库存"""
        if quantity <= 0:
            raise InvalidQuantityError(quantity)
        
        if product_name in self.stock:
            self.stock[product_name] += quantity
        else:
            self.stock[product_name] = quantity
    
    def remove_stock(self, product_name: str, quantity: int) -> None:
        """移除库存"""
        if quantity <= 0:
            raise InvalidQuantityError(quantity)
        
        if product_name not in self.stock:
            raise OutOfStockError(product_name)
        
        if self.stock[product_name] < quantity:
            raise OutOfStockError(product_name)
        
        self.stock[product_name] -= quantity
    
    def get_stock(self, product_name: str) -> int:
        """获取库存数量"""
        return self.stock.get(product_name, 0)

# ==================== 练习3：装饰器 ====================

def log_execution(func):
    """记录函数执行的装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        print(f"[LOG] 开始执行: {func.__name__}")
        
        try:
            result = func(*args, **kwargs)
            end_time = time.time()
            print(f"[LOG] 执行完成: {func.__name__}, 耗时: {end_time - start_time:.4f}秒")
            return result
        except Exception as e:
            end_time = time.time()
            print(f"[LOG] 执行失败: {func.__name__}, 错误: {e}, 耗时: {end_time - start_time:.4f}秒")
            raise
    
    return wrapper

def retry(max_attempts: int = 3, delay: float = 1.0):
    """重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        print(f"第{attempt + 1}次尝试失败，{delay}秒后重试...")
                        time.sleep(delay)
            
            print(f"所有{max_attempts}次尝试都失败了")
            raise last_exception
        
        return wrapper
    return decorator

# ==================== 练习4：生成器 ====================

def read_large_file(filepath: str) -> Generator[str, None, None]:
    """逐行读取大文件的生成器"""
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            yield line.strip()

def batch_process(items: List, batch_size: int = 10) -> Generator[List, None, None]:
    """分批处理数据的生成器"""
    for i in range(0, len(items), batch_size):
        yield items[i:i + batch_size] #切片

# ==================== 练习5：上下文管理器 ====================

class Timer:
    """计时上下文管理器"""
    def __enter__(self):
        self.start = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        self.elapsed = self.end - self.start
        print(f"耗时: {self.elapsed:.4f}秒")

class FileHandler:
    """文件处理上下文管理器"""
    def __init__(self, filename: str, mode: str = 'r'):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        self.file = open(self.filename, self.mode, encoding='utf-8')
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()

# ==================== 练习6：综合应用 ====================

@log_execution
@retry(max_attempts=2, delay=0.5)
def process_order(cart: ShoppingCart, inventory: Inventory) -> Dict:
    """处理订单"""
    order_summary = {
        "order_id": f"ORD{int(time.time())}",
        "timestamp": datetime.now().isoformat(),
        "items": [],
        "total_price": cart.total_price(),
        "status": "pending"
    }
    
    # 检查库存并扣除
    for item in cart:
        try:
            inventory.remove_stock(item.name, 1)  # 假设每个商品买1个
            order_summary["items"].append({
                "name": item.name,
                "price": item.price,
                "category": item.category
            })
        except InventoryError as e:
            order_summary["status"] = "failed"
            order_summary["error"] = str(e)
            return order_summary
    
    order_summary["status"] = "completed"
    return order_summary

# ==================== 测试函数 ====================

def test_oop():
    """测试面向对象编程"""
    print("=== 测试面向对象编程 ===")
    
    # 创建产品
    laptop = Product("Laptop", 999.99, "Electronics")
    book = Product("Python Book", 39.99, "Books")
    coffee = Product("Coffee", 4.99, "Food")
    
    # 应用折扣
    laptop.apply_discount(10)
    print(f"折扣后笔记本价格: ${laptop.price:.2f}")
    
    # 创建购物车
    cart = ShoppingCart()
    cart.add_item(laptop)
    cart.add_item(book)
    cart.add_item(coffee)
    
    print(f"购物车中有 {len(cart)} 件商品")
    print(f"总价: ${cart.total_price():.2f}")
    
    # 迭代购物车
    print("购物车内容:")
    for item in cart:
        print(f"  - {item}")

def test_exceptions():
    """测试异常处理"""
    print("\n=== 测试异常处理 ===")
    
    inventory = Inventory()
    inventory.add_stock("Laptop", 5)
    inventory.add_stock("Coffee", 10)
    
    try:
        inventory.remove_stock("Laptop", 3)
        print("成功移除3台笔记本")
        
        inventory.remove_stock("Laptop", 5)  # 应该失败
    except OutOfStockError as e:
        print(f"库存错误: {e}")
    
    try:
        inventory.add_stock("Book", -1)  # 应该失败
    except InvalidQuantityError as e:
        print(f"数量错误: {e}")

def test_decorators():
    """测试装饰器"""
    print("\n=== 测试装饰器 ===")
    
    @log_execution
    def slow_function():
        """模拟慢速函数"""
        time.sleep(0.5)
        return "完成"
    
    @retry(max_attempts=3, delay=0.2)
    def unreliable_function():
        """模拟不可靠函数"""
        import random
        if random.random() < 0.7:  # 70%失败率
            raise ValueError("随机失败")
        return "成功"
    
    print("测试日志装饰器:")
    result = slow_function()
    print(f"结果: {result}")
    
    print("\n测试重试装饰器:")
    try:
        result = unreliable_function()
        print(f"结果: {result}")
    except Exception as e:
        print(f"最终失败: {e}")

def test_generators():
    """测试生成器"""
    print("\n=== 测试生成器 ===")
    
    # 创建测试数据
    numbers = list(range(1, 101))
    
    print("分批处理数字:")
    for batch in batch_process(numbers, batch_size=15):
        print(f"  批次: {batch}")
        if len(batch) < 15:  # 只显示前几个批次
            break

def test_context_managers():
    """测试上下文管理器"""
    print("\n=== 测试上下文管理器 ===")
    
    print("使用Timer上下文管理器:")
    with Timer():
        time.sleep(0.3)
    
    # 测试文件处理
    test_filename = "test_output.txt"
    with FileHandler(test_filename, 'w') as f:
        f.write("Hello, World!\n")
        f.write("This is a test file.\n")
    
    with FileHandler(test_filename, 'r') as f:
        content = f.read()
        print(f"文件内容:\n{content}")
    
    # 清理测试文件
    import os
    if os.path.exists(test_filename):
        os.remove(test_filename)

def test_integration():
    """测试综合应用"""
    print("\n=== 测试综合应用 ===")
    
    # 创建库存
    inventory = Inventory()
    inventory.add_stock("Laptop", 2)
    inventory.add_stock("Coffee", 5)
    
    # 创建购物车
    cart = ShoppingCart()
    cart.add_item(Product("Laptop", 999.99, "Electronics"))
    cart.add_item(Product("Coffee", 4.99, "Food"))
    cart.add_item(Product("Laptop", 999.99, "Electronics"))  # 第二台笔记本
    
    print("处理订单:")
    order_result = process_order(cart, inventory)
    print(json.dumps(order_result, indent=2, ensure_ascii=False))

def main():
    """主函数"""
    print("Python高级特性练习 - Day 5")
    print("=" * 50)
    
    test_oop()
    test_exceptions()
    test_decorators()
    test_generators()
    test_context_managers()
    test_integration()
    
    print("\n" + "=" * 50)
    print("所有测试完成!")

if __name__ == "__main__":
    main()