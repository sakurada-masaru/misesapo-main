"""
ID生成ヘルパー関数
5桁のゼロパディング形式でIDを生成する
"""
import re
from boto3.dynamodb.conditions import Key, Attr

def extract_number_from_id(id_str, prefix):
    """
    IDから数値部分を抽出
    例: 'CL00001' -> 1, 'CL0018' -> 18, '18' -> 18
    """
    if not id_str:
        return 0
    str_id = str(id_str)
    
    # プレフィックスを除去
    if str_id.startswith(prefix):
        str_id = str_id[len(prefix):]
    
    # 数値部分を抽出
    match = re.match(r'^0*(\d+)', str_id)
    if match:
        return int(match.group(1))
    return 0

def get_max_id_number(table, prefix):
    """
    テーブル内の最大ID番号を取得
    """
    try:
        # テーブルをスキャンしてすべてのIDを取得
        response = table.scan(
            ProjectionExpression='id'
        )
        
        max_num = 0
        for item in response.get('Items', []):
            item_id = item.get('id', '')
            num = extract_number_from_id(item_id, prefix)
            if num > max_num:
                max_num = num
        
        # ページネーション対応
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                ProjectionExpression='id',
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            for item in response.get('Items', []):
                item_id = item.get('id', '')
                num = extract_number_from_id(item_id, prefix)
                if num > max_num:
                    max_num = num
        
        return max_num
    except Exception as e:
        print(f"Error getting max ID: {str(e)}")
        return 0

def generate_next_id(table, prefix):
    """
    次のIDを生成（5桁形式）
    例: CL00001, BR00001, ST00001, W00001, CU00001
    """
    max_num = get_max_id_number(table, prefix)
    next_num = max_num + 1
    return f"{prefix}{str(next_num).zfill(5)}"

